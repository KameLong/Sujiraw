
using Sujiraw.Data.Common;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data;
using System.Linq;
using System.Reflection.Metadata;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;
using Npgsql;

namespace Sujiraw.Data
{
    public class TimeTable : BaseTable
    {
        public static readonly string TABLE_NAME = "TimeTable";

        public long TimeTableID { get; set; }
        public long CompanyID { get; set; }
        public string Name { get; set; } = "";
        public string Color { get; set; } = "#000000";
        public TimeTable(long companyID)
        {
            TimeTableID = MyRandom.NextSafeLong();
            CompanyID = companyID;
        }
        public TimeTable(DbDataReader reader)
        {
            TimeTableID = reader.GetInt64(nameof(TimeTableID));
            CompanyID = reader.GetInt64(nameof(CompanyID));
            Name = reader.GetString(nameof(Name));
            Color = reader.GetString(nameof(Color));
        }

        static public TimeTable GetByID(DbConnection conn, long id)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME} where {nameof(TimeTableID)}=@{nameof(TimeTableID)}";
                command.Parameters.Add(new NpgsqlParameter(nameof(TimeTableID), id));
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        return new TimeTable(reader);
                    }
                }
                throw new Exception("not found");
            }
        }
        static public void Insert(DbConnection conn, List<TimeTable> insertItems)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText =
                    $"INSERT INTO {TABLE_NAME} ({nameof(TimeTableID)},{nameof(CompanyID)},{nameof(Name)},{nameof(Color)}) " +
                    $"values (@{nameof(TimeTableID)},@{nameof(CompanyID)},@{nameof(Name)},@{nameof(Color)}) " +
                    $"ON CONFLICT ON CONSTRAINT {TABLE_NAME}_pkey " +
                    $"DO UPDATE SET {nameof(Name)} = EXCLUDED.{nameof(Name)},{nameof(Color)} = EXCLUDED.{nameof(Color)}";

                command.Parameters.Add(CreateParameter(command, nameof(TimeTableID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(CompanyID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(Name), DbType.String));
                command.Parameters.Add(CreateParameter(command, nameof(Color), DbType.String));
                command.Prepare();
                foreach (var item in insertItems)
                {
                    command.Parameters[nameof(TimeTableID)].Value = item.TimeTableID;
                    command.Parameters[nameof(CompanyID)].Value = item.CompanyID;
                    command.Parameters[nameof(Name)].Value = item.Name;
                    command.Parameters[nameof(Color)].Value = item.Color;
                    command.ExecuteNonQuery();
                }
            }
        }
        static public void Delete(DbConnection conn,long timetableID)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"DELETE FROM {TABLE_NAME} where {nameof(TimeTableID)}=@{nameof(TimeTableID)}";
                command.Parameters.Add(new NpgsqlParameter(nameof(TimeTableID), timetableID));
                command.ExecuteNonQuery();
            }
        }
        static public IEnumerable<TimeTable> GetAll(DbConnection conn)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME}";
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        yield return new TimeTable(reader);
                    }
                }
            }
        }
        static public IEnumerable<TimeTable> GetFromCompany(DbConnection conn, long companyID)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME} where {nameof(CompanyID)} = @{nameof(CompanyID)}";
                command.Parameters.Add(new NpgsqlParameter(nameof(CompanyID), companyID));
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        yield return new TimeTable(reader);
                    }
                }
            }
        }
    }
    partial class PostgresDbService
    {
        public List<TimeTable> GetAllTimeTable()
        {
            return TimeTable.GetAll(this.conn).ToList();
        }
        public List<TimeTable> GetTimeTableByCompany(long companyID)
        {
            return TimeTable.GetFromCompany(this.conn, companyID).ToList();
        }
        public TimeTable GetTimeTable(long timetableID)
        {
            return TimeTable.GetByID(this.conn, timetableID);
        }
        public void DeleteTimeTable(long timetableID)
        {
            TimeTable.Delete(this.conn, timetableID);
            TimeTableStation.DeleteFromTimeTable(this.conn, timetableID);

        }

        public void InsertTimeTable(List<TimeTable> timetables)
        {
            TimeTable.Insert(this.conn, timetables);
        }
    }

}
