﻿using System;
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
        
        public int Id { get; set; }

        public int Number { get; set; }
          
        public int? CityId { get; set; }

        public int? StreetId { get; set; }

        public int? NeighborhoodId { get; set; }

        [StringLength(10)]
        public string House { get; set; }
        
        public City City { get; set; }

        public Street Street { get; set; }
        
        public int? RegionPartId { get; set; }        

        public RegionPart RegionPart { get; set; }

        public Neighborhood Neighborhood { get; set; }

        public ICollection<PrecinctAddress> PrecinctAddresses { get; set; }

        public double? lat { get; set; }

        public double? lng { get; set; }

        public string location_type { get; set; }

        public ICollection<DistrictPrecinct> DistrictPrecincts { get; set; }

        public ICollection<UserPrecinct> UserPrecincts { get; set; }

        
    }
}