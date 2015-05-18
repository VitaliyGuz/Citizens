﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Citizens.Models
{
    public enum RegionPartType { область, місто };

    public class RegionPart
    {
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; }

        [Required]
        public int RegionId { get; set; }

        public Region Region { get; set; }

        public RegionPartType RegionPartType { get; set; }

        public ICollection<City> Cities { get; set; }
    }
}