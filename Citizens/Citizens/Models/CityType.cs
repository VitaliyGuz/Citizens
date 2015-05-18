using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;

namespace Citizens.Models
{   
    public class CityType
    {
        
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; }

        //public ICollection<City> Cities { get; set; }

    }
}
