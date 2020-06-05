
import Stat from '../stat/stat.model';
import Block from '../block/block.model';

function getDate(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getToday() {
    const now = new Date();
    return getDate(now);
}

export function daily(req, res, next) {
    res.status(204).send();
}

export function perUser(req, res) {
    res.status(204).send();
}

export async function all(req, res, next) {
    const startOfToday = getToday();

    var aggregation = [
        {
            $group: {
                _id: null,
                total: {
                    $sum: "$success"
                }
            }
        },
        { $limit: 1 }
    ];

    const perUserTotal = await Block.count();

    const perUserToday = await Block.count()
        .where('createdAt')
        .gt(startOfToday);

    const dailyTotal = await Stat.aggregate(aggregation);

    aggregation.unshift({ $match: { "sessionDate": { $gt: startOfToday } } });

    const dailyToday = await Stat.aggregate(aggregation);

    res.json({
        perUser: {
            today: perUserToday,
            total: perUserTotal
        },
        daily: {
            today: dailyToday[0] ? dailyToday[0]["total"] : 0,
            total: dailyTotal[0] ? dailyTotal[0]["total"] : 0
        }
    });
}
