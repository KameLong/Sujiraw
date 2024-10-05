using Microsoft.Data.Sqlite;
using Sujiro.Data.Common;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using System.Data.Common;

namespace Sujiro.Data
{
    [Table(TABLE_NAME)]
    public class TrainType:BaseTable
    {
        public const string TABLE_NAME = "TrainType";
        public long TrainTypeID { get; set; }
        public long CompanyID { get; set; }
        public string Name { get; set; } = "";
        public string ShortName { get; set; } = "";
        public string Color { get; set; } = "#000000";


        //時刻表フォントを太字にします。
        public bool FontBold { get; set; } = false;
        //時刻表フォントを斜体にします。
        public bool FontItalic { get; set; } = false;

        //ダイヤ線を太字にします。
        public bool LineBold { get; set; } = false;
        //ダイヤ線を破線にします。
        public bool LineDashed { get; set; } = false;


        public TrainType(long companyID)
        {
            TrainTypeID = MyRandom.NextSafeLong();
            CompanyID = companyID;
        }
        public TrainType(DbDataReader reader)
        {
            TrainTypeID = reader.GetInt64(nameof(TrainTypeID));
            CompanyID = reader.GetInt64(nameof(CompanyID));
            Name = reader.GetString(nameof(Name));
            ShortName = reader.GetString(nameof(ShortName));
            Color = reader.GetString(nameof(Color));
            FontBold = reader.GetBoolean(nameof(FontBold));
            FontItalic = reader.GetBoolean(nameof(FontItalic));
            LineBold = reader.GetBoolean(nameof(LineBold));
            LineDashed = reader.GetBoolean(nameof(LineDashed));

        }

        static public void Insert(DbConnection conn, List<TrainType> insertItems)
        {
            using (var command = conn.CreateCommand())
            {
                   command.CommandText=
                    $"INSERT INTO {TABLE_NAME} ({nameof(TrainTypeID)},{nameof(CompanyID)},{nameof(Name)},{nameof(ShortName)},{nameof(Color)},{nameof(FontBold)},{nameof(FontItalic)},{nameof(LineBold)},{nameof(LineDashed)}) " +
                    $"values (@{nameof(TrainTypeID)},@{nameof(CompanyID)},@{nameof(Name)},@{nameof(ShortName)},@{nameof(Color)},@{nameof(FontBold)},@{nameof(FontItalic)},@{nameof(LineBold)},@{nameof(LineDashed)}) " +
                    $"ON CONFLICT ON CONSTRAINT {TABLE_NAME}_pkey " +
                    $"DO UPDATE SET {nameof(Name)} = EXCLUDED.{nameof(Name)},{nameof(ShortName)} = EXCLUDED.{nameof(ShortName)},{nameof(Color)} = EXCLUDED.{nameof(Color)},{nameof(FontBold)} = EXCLUDED.{nameof(FontBold)},{nameof(FontItalic)} = EXCLUDED.{nameof(FontItalic)},{nameof(LineBold)} = EXCLUDED.{nameof(LineBold)},{nameof(LineDashed)} = EXCLUDED.{nameof(LineDashed)}";
                command.Parameters.Add(CreateParameter(command, nameof(TrainTypeID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(CompanyID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(Name), DbType.String));
                command.Parameters.Add(CreateParameter(command, nameof(ShortName), DbType.String));
                command.Parameters.Add(CreateParameter(command, nameof(Color), DbType.String));
                command.Parameters.Add(CreateParameter(command, nameof(FontBold), DbType.Boolean));
                command.Parameters.Add(CreateParameter(command, nameof(FontItalic), DbType.Boolean));
                command.Parameters.Add(CreateParameter(command, nameof(LineBold), DbType.Boolean));
                command.Parameters.Add(CreateParameter(command, nameof(LineDashed), DbType.Boolean));

                command.Prepare();
                foreach (var item in insertItems)
                {
                    command.Parameters[nameof(TrainTypeID)].Value = item.TrainTypeID;
                    command.Parameters[nameof(CompanyID)].Value = item.CompanyID;
                    command.Parameters[nameof(Name)].Value = item.Name;
                    command.Parameters[nameof(ShortName)].Value = item.ShortName;
                    command.Parameters[nameof(Color)].Value = item.Color;
                    command.Parameters[nameof(FontBold)].Value = item.FontBold;
                    command.Parameters[nameof(FontItalic)].Value = item.FontItalic;
                    command.Parameters[nameof(LineBold)].Value = item.LineBold;
                    command.Parameters[nameof(LineDashed)].Value = item.LineDashed;
                    command.ExecuteNonQuery();
                }
            }
        }
        static public TrainType GetByID(DbConnection conn, long id)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME} where {nameof(TrainTypeID)}=@{nameof(TrainTypeID)}";
                command.Parameters.Add(new SqliteParameter(nameof(TrainTypeID), id));
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        return new TrainType(reader);
                    }
                }
                throw new Exception("not found");
            }
        }
        static public IEnumerable<TrainType> GetAll(DbConnection conn)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME}";
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        yield return new TrainType(reader);
                    }
                }
            }
        }
    }
    partial class PostgresDbService
    {
        public List<TrainType> GetAllTrainType()
        {
            return TrainType.GetAll(this.conn).ToList();
        }
        public TrainType GetTrainType(long stationID)
        {
            return TrainType.GetByID(this.conn, stationID);
        }
        public void InsertTrainType(List<TrainType> stations)
        {
            TrainType.Insert(this.conn, stations);
        }
    }
}
