using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sujiraw.Data
{
    public partial class PostgresDbService : IDisposable
    {

        private readonly NpgsqlConnection conn;

        public NpgsqlCommand Command => conn.CreateCommand();

        private NpgsqlTransaction? tran=null;
        public NpgsqlCommand CreateCommand()
        {
            return conn.CreateCommand();
        }
        public PostgresDbService(string connectionString)
        {
            this.conn = new NpgsqlConnection(connectionString);
            this.conn.Open();
        }

        public void Dispose()
        {
                this.conn?.Dispose();
                this.tran?.Dispose();
            GC.SuppressFinalize(this);
        }
        public void BeginTransaction()
        {
            tran?.Dispose();
            tran =this.conn.BeginTransaction();
        }
        public void Commit()
        {
            tran?.Commit();
        }
        public void Rollback()
        {
            tran?.Rollback();
        }
    }
    public enum DeleteResult
    {
        SUCCESS,
        NOT_FOUND,
        DELETE_ERROR
    }
}
