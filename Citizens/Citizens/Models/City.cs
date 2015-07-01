using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;

namespace Citizens.Models
{
    public class City
    {

        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; }

        [Required]
        public int CityTypeId { get; set; }

        public bool IncludedToRegionPart { get; set; }

        public CityType CityType { get; set; }
        
        public int? RegionPartId { get; set; }        

        public RegionPart RegionPart { get; set; }

        public ICollection<Person> Persons { get; set; }

        public ICollection<PersonChangeHistory> PersonChangeHistory { get; set; }

        public ICollection<CityRegionPart> CityRegionParts { get; set; }

        public ICollection<PrecinctAddress> PrecinctAddresses { get; set; }
    }
}
