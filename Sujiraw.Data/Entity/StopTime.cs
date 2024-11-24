
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Sujiraw.Data.Entity
{
    [Table("stoptime")]
    // [Index(nameof(TripId), nameof(Sequence), IsUnique = true)]
    public class StopTime
    {
        [Column("tripid")]
        public long TripId { get; set; }=0;
        [Column("sequence")]
        public int Sequence { get; set; } = 0;
        [Column("deptime")]
        public int DepTime { get; set; } = -1;
        [Column("aritime")]
        public int AriTime { get; set; } = -1;
        [Column("stoptype")]
        public int StopType { get; set; } = 0;
    }

}
