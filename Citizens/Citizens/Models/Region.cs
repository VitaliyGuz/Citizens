﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;

namespace Citizens.Models
{
    public class Region
    {
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; }

        public ICollection<RegionPart> RegionParts { get; set; }

        public ICollection<City> Cities { get; set; }

        public ICollection<UserRegion> UserRegions { get; set; }

    }
}