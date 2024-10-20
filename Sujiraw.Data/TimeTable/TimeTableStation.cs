
using Sujiraw.Data.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Data.Common;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;
using Npgsql;

namespace Sujiraw.Data
{

    public class TimeTableStation : BaseTable
    {
        public static readonly string TABLE_NAME = "TimeTableStation";

        public long TimeTableStationID { get; set; }

        public long TimeTableID { get; set; } = 0;
        public long AriRouteStationID { get; set; } = 0;
        public long DepRouteStationID { get; set; } = 0;
        public int Sequence { get; set; } = 0;
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
        public int ShowStyle { get; set; } = 0;

        public TimeTableStation(long timeTableID)
        {
            TimeTableStationID = MyRandom.NextSafeLong();
            this.TimeTableID = timeTableID;

        }
        public TimeTableStation(DbDataReader reader)
        {
            TimeTableStationID = reader.GetInt64(nameof(TimeTableStationID));
            TimeTableID = reader.GetInt64(nameof(TimeTableID));
            AriRouteStationID = reader.GetInt64(nameof(AriRouteStationID));
            DepRouteStationID = reader.GetInt64(nameof(DepRouteStationID));
            Sequence = reader.GetInt32(nameof(Sequence));
            ShowStyle = reader.GetInt32(nameof(ShowStyle));
        }

        static public void Insert(DbConnection conn, List<TimeTableStation> insertItems)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText =
                    $"INSERT INTO {TABLE_NAME} ({nameof(TimeTableStationID)},{nameof(TimeTableID)},{nameof(AriRouteStationID)},{nameof(DepRouteStationID)},{nameof(Sequence)},{nameof(ShowStyle)}) " +
                    $"values (@{nameof(TimeTableStationID)},@{nameof(TimeTableID)},@{nameof(AriRouteStationID)},@{nameof(DepRouteStationID)},@{nameof(Sequence)},@{nameof(ShowStyle)}) " +
                    $"ON CONFLICT ON CONSTRAINT {TABLE_NAME}_pkey " +
                    $"DO UPDATE SET {nameof(Sequence)} = EXCLUDED.{nameof(Sequence)},{nameof(ShowStyle)} = EXCLUDED.{nameof(ShowStyle)}";

                command.Parameters.Add(CreateParameter(command, nameof(TimeTableStationID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(TimeTableID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(AriRouteStationID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(DepRouteStationID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(Sequence), DbType.Int32));
                command.Parameters.Add(CreateParameter(command, nameof(ShowStyle), DbType.Int32));


                command.Prepare();
                foreach (var item in insertItems)
                {
                    command.Parameters[nameof(TimeTableStationID)].Value = item.TimeTableStationID;
                    command.Parameters[nameof(TimeTableID)].Value = item.TimeTableID;
                    command.Parameters[nameof(AriRouteStationID)].Value = item.AriRouteStationID;
                    command.Parameters[nameof(DepRouteStationID)].Value = item.DepRouteStationID;
                    command.Parameters[nameof(Sequence)].Value = item.Sequence;
                    command.Parameters[nameof(ShowStyle)].Value = item.ShowStyle;

                    command.ExecuteNonQuery();
                }
            }
        }
        static public TimeTableStation GetByID(DbConnection conn, long id)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME} where {nameof(TimeTableStationID)}=@{nameof(TimeTableStationID)}";
                command.Parameters.Add(new NpgsqlParameter(nameof(TimeTableStationID), id));
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        return new TimeTableStation(reader);
                    }
                }
                throw new Exception("not found");
            }
        }
        static public IEnumerable<TimeTableStation> GetAll(DbConnection conn)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME}";
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        yield return new TimeTableStation(reader);
                    }
                }
            }
        }
        static public IEnumerable<TimeTableStation> GetByTimeTableID(DbConnection conn, long timeTableID)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME} where {nameof(TimeTableID)}=@{nameof(TimeTableID)} order by {nameof(Sequence)}";
                command.Parameters.Add(new NpgsqlParameter(nameof(TimeTableID), timeTableID));
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        yield return new TimeTableStation(reader);
                    }
                }
            }
        }
        static public void DeleteFromTimeTable(DbConnection conn, long timetableID)
        {
            using var command = conn.CreateCommand();
            command.CommandText = $"DELETE FROM {TABLE_NAME} where {nameof(TimeTableID)}=@{nameof(TimeTableID)}";
            command.Parameters.Add(new NpgsqlParameter(nameof(TimeTableID), timetableID));
            command.ExecuteNonQuery();
        }
    }

    partial class PostgresDbService
    {
        public List<TimeTableStation> GetAllTimeTableStation()
        {
            return TimeTableStation.GetAll(this.conn).ToList();
        }
        public TimeTableStation GetTimeTableStation(long timetableStationID)
        {
            return TimeTableStation.GetByID(this.conn, timetableStationID);
        }
        public void InsertTimeTableStation(List<TimeTableStation> stations)
        {
            TimeTableStation.Insert(this.conn, stations);
        }
        public List<TimeTableStation> GetTimeTableStationByTimeTable(long timeTableID)
        {
            return TimeTableStation.GetByTimeTableID(this.conn, timeTableID).ToList();
        }
        
    }
}
