using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace Citizens.Models
{
    public class District
    {
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int Id { get; set; }

        public int? DistrictTypeId { get; set; }

        public DistrictType DistrictType { get; set; }

        public ICollection<Precinct> Precincts { get; set; }

        public ICollection<DistrictPrecinct> DistrictPrecincts { get; set; }
    }
}