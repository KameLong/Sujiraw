using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sujiro.Data
{
    public partial class PostgresDbService : IDisposable
    {

        private NpgsqlConnection conn;

        private NpgsqlTransaction? tran=null;
        public PostgresDbService(string connectionString)
        {
            this.conn = new NpgsqlConnection(connectionString);
            this.conn.Open();
        }

        public void Dispose()
        {
            if (this.conn != null)
            {
                this.conn.Dispose();
            }
            if (tran != null)
            {
                this.tran.Dispose();
            }
        }
        public void BeginTransaction()
        {
            if(tran!=null)
            {
                tran.Dispose();
            }
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
}
