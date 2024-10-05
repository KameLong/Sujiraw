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
        }
    }
}
