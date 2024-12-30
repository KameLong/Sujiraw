
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sujiraw.Data.Entity
{

    [Table("routestation")]
    public class RouteStation
    {
        [Key] [Column("routestationid")] public long RouteStationId { get; set; }

        [Column("routeid")] public long RouteId { get; set; } = 0;
        [Column("stationid")] public long StationId { get; set; } = 0;

        [Column("sequence")] public int Sequence { get; set; } = 0;

        /*
         *bit　単位で役割を切り替えます。
         *0:下り発時刻
         *1:下り発着番線
         *2:下り着時刻
         *3-7 下り時刻表予備
         *8:上り発時刻
         *9:上り発着番線
         *10:上り着時刻
         *11-15:上り時刻表予備
         *16-23:ダイヤグラム予備
         *24:主要駅フラグ
         *
         */
        [Column("showstyle")] public int ShowStyle { get; set; } = 0;
    }

}
