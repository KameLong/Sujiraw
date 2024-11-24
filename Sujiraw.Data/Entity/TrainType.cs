
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sujiraw.Data.Entity
{
    [Table("traintype")]
    public class TrainType
    {
        [Key]
        [Column("traintypeid")]
        public long TrainTypeId { get; set; }
        [Column("companyid")]
        public long CompanyId { get; set; }
        [Column("name")]
        public string Name { get; set; } = "";
        [Column("shortname")]
        public string ShortName { get; set; } = "";
        [Column("color")]
        public string Color { get; set; } = "#000000";


        //時刻表フォントを太字にします。
        [Column("fontbold")]
        public bool FontBold { get; set; } = false;
        //時刻表フォントを斜体にします。
        [Column("fontitalic")]
        public bool FontItalic { get; set; } = false;

        //ダイヤ線を太字にします。
        [Column("linebold")]
        public bool LineBold { get; set; } = false;
        //ダイヤ線を破線にします。
        [Column("linedashed")]
        public bool LineDashed { get; set; } = false;


    }
}
