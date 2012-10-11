/**
 * COD����Ѽ��㣬ע�ⲻ����ʼ�˷�
 * @param {Number} initPayment ��ʼ���ܽ������ܼƣ������Ӷ����Żݺ�ļ۸񣬵�λ����.
 * @param {Number} fare ��ʼ���˷ѣ���λ����.
 * @param {Number} level COD��λ����λ����.
 * @param {Array} subOrders �Ӷ������ܼ۸�COD��ҷ���ѱ���, [[����1�۸񣬶���1����], [����2�۸񣬶���2����], ..]����λ��Ԫ.
 * @param {Boolean} all �Ƿ񷵻���������.
 */
var calculateServiceFee = function(initPayment, fare, level, subOrders, all) {
    var isInSale = false;
    if (isInSale) return 0;

    // ��֤�Ƿ�����ȷ�����ݣ���������
    var checkInt = function(val) {
        return /^\d+$/.test(val.toString());
    };

    if (!checkInt(initPayment) || !checkInt(fare)) {
        return -1;
    }

    if (!level) {
        return fare;
    }

    var M = Math, RND = M.round, FLR = M.floor, PF = parseFloat;

    level = level.split('|');
    var r = level[1], min = level[0], max = level[2];

    // �˷�Ϊ0��ֱ������ȡ����Ȼ�󷵻�
    if (fare === 0) {
        var m = initPayment < 100 ? 'ceil' : 'floor';
        serviceFee = -(initPayment - M[m](initPayment / 100) * 100);
        return all ? {
            serviceFee: serviceFee,
            factor: 0
        } : serviceFee;
    }

    //�𲽼�
    var MIN = min ? RND(PF(min) * 100) : null;
    //�ⶥ��
    var MAX = max ? RND(PF(max) * 100) : null;

    // �������ѱ��ʣ����Ƿ���Ҫȡ��
    var factor = 0, sum = 0, total = 0, dofloor = true;
    for (var i = 0, l = subOrders.length; i < l; i++) {
        total += subOrders[i][0] * subOrders[i][1];
        sum += subOrders[i][0];
    }

    // ���б������������100%��ʱ������ȡ��
    for (var i = 0, l = subOrders.length; i < l; i++) {
        if (subOrders[i][1] === 100) {
            dofloor = false;
            break;
        }
    }

    factor = total / (sum * 100);

    //������COD����Ϊ�գ���Ĭ��Ϊ��ҳе�ȫ��COD�����
    factor = !factor ? 0 : factor;

    // ��ұ�������ȡ����λ�����Ҳ����ô���㣬�ᶪ����
    factor = M.floor(factor * 100) / 100;

    // ��Ʒ���� * ���� - �����Ż�֮��ļ۸񣬼���COD��ݷѺ���Է�����ʺ�õ�������COD�����
    var serviceFee = RND((initPayment + fare) * PF(r));

    // �������������Ƚϣ�ȡ���н�С��ֵ
    serviceFee = (MAX && serviceFee > MAX) ? MAX : serviceFee;
    // �������������Ƚϣ�ȡ���нϴ��ֵ
    serviceFee = (MIN && serviceFee < MIN) ? MIN : serviceFee;

    // ���Ӧ�óе��ķ���ѽ��
    serviceFee = RND(serviceFee * factor);

    // Ϊ��ʹCOD������ȡ���㣬��Ҫȡ��
    // һ���������£�ֻҪ��һ����Ʒ��ҳе��ķ���ѱ�����100%�ģ�
    // �ͽ�����������Ĳ�������������ͷ����ҷ���ѳе����������ӵ��˷���
    var method = '';
    if ((serviceFee + initPayment + fare) < 100) {
        method = 'ceil';
    } else if (dofloor) {
        method = 'floor';
    } else {
        method = 'round';
    }

    // ȡ������
    var totalServiceAndFee = (M[method]((serviceFee + initPayment + fare) / 100)) * 100;
    serviceFee = RND(totalServiceAndFee - initPayment - fare);

    // �������������Ƚϣ�ȡ���н�С��ֵ
    while (MAX && serviceFee > MAX) {
        serviceFee = RND(serviceFee - 100);
    }

    // ����ҳе�100%����ѣ����ٱȽ�һ����
    if (1 === factor && MIN && serviceFee < MIN) {
        // �������������Ƚϣ�ȡ���нϴ��ֵ
        serviceFee = serviceFee + (FLR((MIN - 1 - serviceFee) / 100) + 1) * 100;
    }

    // ֻҪ��һ�����100%����ѣ��ҽ��С��0���Ͳ�����һ��ȡ��
    if (!dofloor && serviceFee < 0) {
        serviceFee += 100;
    }

    if (typeof console !== 'undefined') {
        console.log('params:', initPayment, fare, level, subOrders, all);
        console.log('result:', factor, serviceFee);
    }

    return all ? {
        factor: factor,
        serviceFee: serviceFee
    } : serviceFee;
};
