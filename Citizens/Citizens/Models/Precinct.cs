using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace Citizens.Models
{
    public class Precinct
    {
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int Id { get; set; }
          
        public int? CityId { get; set; }

        public int? StreetId { get; set; }

        [StringLength(10)]
        public string House { get; set; }

        [Required]
        public int DistrictId { get; set; }
        public City City { get; set; }

        public Street Street { get; set; }

        public District District { get; set; }

        public int? RegionPartId { get; set; }        

        public RegionPart RegionPart { get; set; }

        public ICollection<PrecinctAddress> PrecinctAddresses { get; set; }

        public double? lat { get; set; }

        public double? lng { get; set; }

        public string location_type { get; set; }

        
    }
}