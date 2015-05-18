using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using System.Web.Http;

namespace Citizens.Models
{
    public class Street
    {
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; }
        
        public int StreetTypeId { get; set; }
        public StreetType StreetType { get; set; }

		//[HttpBindNever]
		//public ICollection<Person> Persons { get; set; }

    }
}