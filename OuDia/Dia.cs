using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OuDia
{
    public class Dia(Diagram diagram)
    {
        public List<Train> Trains { get; set; } = new List<Train>();
        public Diagram diagram=diagram;

  
        public void Read(StreamReader sr)
        {
            while (true)
            {
                var str = sr.ReadLine();
                switch (str)
                {
                    case ".":
                        return;
                    case "Ressya.":
                        var train = new Train(this);
                        train.Read(sr);
                        Trains.Add(train);
                        break;
                    case null:
                        break;
                    default:
                        if (! str.Contains('='))
                        {
                            throw new Exception(str);
                        }
                        var key = str.Split("=")[0];
                        var value = str.Split("=")[1];
                        switch (key)
                        {
                            default:
                                throw new Exception("Invalid key " + str);
                        }
                }

            }
        }   
    }
}
