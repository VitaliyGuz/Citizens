using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
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

        [NotMapped]
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public string AddressesStr { get; set; }

        [NotMapped]
        public int CountMajors { get; set; }

        [NotMapped]
        public int CountElectors { get; set; }

        [NotMapped]
        public int CountHouseholds { get; set; }
    }

    public class WorkAreaComputed
    {
        public int Id { get; set; }
        
        public string AddressesStr { get; set; }

        public int CountMajors { get; set; }
        
        public int CountElectors { get; set; }
        
        public int CountHouseholds { get; set; }

        public int CountProponents { get; set; }
    }
}