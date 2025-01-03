using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sujiraw.Data.Entity
{
    [Table("timetable")]

    public class TimeTable
    {

        [Key]
        [Column("timetableid")]
        public long TimeTableID { get; set; }

        [Column("company")]
        public long CompanyID { get; set; }

        [Column("name")]
        public string Name { get; set; } = "";

        [Column("color")]
        public string Color { get; set; } = "#000000";

    }
}
