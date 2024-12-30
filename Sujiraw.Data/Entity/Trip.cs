using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sujiraw.Data.Entity
{
    [Table("trip")]
    public class Trip
    {

        [Key] [Column("tripid")] public long TripId { get; set; }

        [Column("routeid")] public long RouteId { get; set; }
        [Column("trainid")] public long TrainId { get; set; }
        [Column("direction")] public int Direction { get; set; }
        [Column("tripseq")] public int TripSeq { get; set; }

        [Column("traintypeid")] public long TrainTypeId { get; set; }

        [Column("name")] public string Name { get; set; } = "";
        [Column("number")] public string Number { get; set; } = "";
        [Column("comment")] public string Comment { get; set; } = "";
        [Column("depstationid")] public long DepStationId { get; set; } = 0;
        [Column("aristationid")] public long AriStationId { get; set; } = 0;
        [Column("deptime")] public int DepTime { get; set; } = -1;
        [Column("aritime")] public int AriTime { get; set; } = -1;
        

    }


}
