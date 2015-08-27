using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Citizens.Models
{
    public class WorkArea
    {
        public int Id { get; set; }

        public int Number { get; set; }

        public int PrecinctId { get; set; }

        public Precinct Precinct { get; set; }

        public int TopId { get; set; }

        public Person Top { get; set; }
          
        public ICollection<PrecinctAddress> PrecinctAddresses { get; set; }
        
    }
}