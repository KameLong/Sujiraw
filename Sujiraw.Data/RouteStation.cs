using Microsoft.Data.Sqlite;
using Sujiro.Data.Common;
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

namespace Sujiro.Data
{

    public class RouteStation:BaseTable
    {
        public static readonly string TABLE_NAME = "RouteStation";

        public long RouteStationID { get; set; }

        public long RouteID { get; set; } = 0;
        public long StationID { get; set; } = 0;
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

        public RouteStation(long routeID,long stationID)
        {
            RouteStationID = MyRandom.NextSafeLong();
            this.RouteID = RouteID;
            this.StationID = stationID;

        }
        public RouteStation(DbDataReader reader)
        {
            RouteStationID = reader.GetInt64(nameof(RouteStationID));
            RouteID = reader.GetInt64(nameof(RouteID));
            StationID = reader.GetInt64(nameof(StationID));
            Sequence = reader.GetInt32(nameof(Sequence));
            ShowStyle = reader.GetInt32(nameof(ShowStyle));
        }

        static public void Insert(DbConnection conn, List<RouteStation> insertItems)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText =
                    $"INSERT INTO {TABLE_NAME} ({nameof(RouteStationID)},{nameof(RouteID)},{nameof(StationID)},{nameof(Sequence)},{nameof(ShowStyle)}) " +
                    $"values (@{nameof(RouteStationID)},@{nameof(RouteID)},@{nameof(StationID)},@{nameof(Sequence)},@{nameof(ShowStyle)}) " +
                    $"ON CONFLICT ON CONSTRAINT {TABLE_NAME}_pkey " +
                    $"DO UPDATE SET {nameof(Sequence)} = EXCLUDED.{nameof(Sequence)},{nameof(ShowStyle)} = EXCLUDED.{nameof(ShowStyle)}";

                command.Parameters.Add(CreateParameter(command, nameof(RouteStationID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(RouteID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(StationID), DbType.Int64));
                    command.Parameters.Add(CreateParameter(command, nameof(Sequence), DbType.Int32));
                command.Parameters.Add(CreateParameter(command, nameof(ShowStyle), DbType.Int32));


                command.Prepare();
                foreach (var item in insertItems)
                {
                    command.Parameters[nameof(RouteStationID)].Value = item.RouteStationID;
                    command.Parameters[nameof(RouteID)].Value = item.RouteID;
                    command.Parameters[nameof(StationID)].Value = item.StationID;
                    command.Parameters[nameof(Sequence)].Value = item.Sequence;
                    command.Parameters[nameof(ShowStyle)].Value = item.ShowStyle;

                    command.ExecuteNonQuery();
                }
            }
        }
        static public RouteStation GetByID(DbConnection conn, long id)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME} where {nameof(RouteStationID)}=@{nameof(RouteStationID)}";
                command.Parameters.Add(new SqliteParameter(nameof(RouteStationID), id));
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        return new RouteStation(reader);
                    }
                }
                throw new Exception("not found");
            }
        }
        static public IEnumerable<RouteStation> GetAll(DbConnection conn)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME}";
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        yield return new RouteStation(reader);
                    }
                }
            }
        }
    }
    partial class PostgresDbService
    {
        public List<RouteStation> GetAllRouteStation()
        {
            return RouteStation.GetAll(this.conn).ToList();
        }
        public RouteStation GetRouteStation(long routeStationID)
        {
            return RouteStation.GetByID(this.conn, routeStationID);
        }
        public void InsertRouteStation(List<RouteStation> stations)
        {
            RouteStation.Insert(this.conn, stations);
        }
    }
}
