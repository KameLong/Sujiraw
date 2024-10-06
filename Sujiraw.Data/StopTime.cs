
using Sujiro.Data.Common;
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

namespace Sujiro.Data
{
    public class StopTime : BaseTable
    {
        public static readonly string TABLE_NAME = "StopTime";

        public long TripID { get; set; }
        public int Sequence { get; set; } = 0;
        public int DepTime { get; set; } = -1;
        public int AriTime { get; set; } = -1;
        public int StopType { get; set; } = 0;
        public StopTime(long tripID)
        {
            TripID = tripID;
        }
        public StopTime(DbDataReader reader)
        {
            TripID = reader.GetInt64(nameof(TripID));
            Sequence = reader.GetInt32(nameof(Sequence));
            DepTime = reader.GetInt32(nameof(DepTime));
            AriTime = reader.GetInt32(nameof(AriTime));
            StopType = reader.GetInt32(nameof(StopType));
        }

        static public void Insert(DbConnection conn, List<StopTime> insertItems)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText =
                    $"INSERT INTO {TABLE_NAME} ({nameof(TripID)},{nameof(Sequence)},{nameof(DepTime)},{nameof(AriTime)},{nameof(StopType)}) " +
                    $"values (@{nameof(TripID)},@{nameof(Sequence)},@{nameof(DepTime)},@{nameof(AriTime)},@{nameof(StopType)})";
                    //$"ON CONFLICT ON CONSTRAINT {TABLE_NAME}_pkey " +
                    //$"DO UPDATE SET {nameof(Sequence)} = EXCLUDED.{nameof(Sequence)},{nameof(DepTime)} = EXCLUDED.{nameof(DepTime)},{nameof(AriTime)} = EXCLUDED.{nameof(AriTime)},{nameof(StopType)} = EXCLUDED.{nameof(StopType)}";


                command.Parameters.Add(CreateParameter(command, nameof(TripID), DbType.Int64));
                command.Parameters.Add(CreateParameter(command, nameof(Sequence), DbType.Int32));
                command.Parameters.Add(CreateParameter(command, nameof(DepTime), DbType.Int32));
                command.Parameters.Add(CreateParameter(command, nameof(AriTime), DbType.Int32));
                command.Parameters.Add(CreateParameter(command, nameof(StopType), DbType.Int32));

                command.Prepare();
                foreach (var item in insertItems)
                {
                    command.Parameters[nameof(TripID)].Value = item.TripID;
                    command.Parameters[nameof(Sequence)].Value = item.Sequence;
                    command.Parameters[nameof(DepTime)].Value = item.DepTime;
                    command.Parameters[nameof(AriTime)].Value = item.AriTime;
                    command.Parameters[nameof(StopType)].Value = item.StopType;

                    command.ExecuteNonQuery();
                }
            }
        }
        static public IEnumerable<StopTime> GetAll(DbConnection conn)
        {
            using (var command = conn.CreateCommand())
            {
                command.CommandText = $"SELECT * FROM {TABLE_NAME}";
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        yield return new StopTime(reader);
                    }
                }
            }
        }
    }
    partial class PostgresDbService
    {
        public List<StopTime> GetAllStopTime()
        {
            return StopTime.GetAll(this.conn).ToList();
        }
        public void InsertStopTime(List<StopTime> stations)
        {
            StopTime.Insert(this.conn, stations);
        }
        public Dictionary<long, List<StopTime>> GetStopTimeFromRoute(long routeID)
        {
            var result = new Dictionary<long, List<StopTime>>();
            var command = conn.CreateCommand();
            command.CommandText = $"select {StopTime.TABLE_NAME}.* from {StopTime.TABLE_NAME} left join {Trip.TABLE_NAME} on {StopTime.TABLE_NAME}.{nameof(StopTime.TripID)} = {Trip.TABLE_NAME}.{nameof(Trip.TripID)} where {nameof(Trip.RouteID)}= @routeID order by {nameof(StopTime.TripID)},{nameof(StopTime.Sequence)};";
            command.Parameters.Add(new NpgsqlParameter("routeID", routeID));
            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    var stopTime = new StopTime(reader);
                    if (!result.ContainsKey(stopTime.TripID))
                    {
                        result[stopTime.TripID] = new List<StopTime>();
                    }
                    result[stopTime.TripID].Add(stopTime);
                }
            }
            return result;
        }
    }

}
