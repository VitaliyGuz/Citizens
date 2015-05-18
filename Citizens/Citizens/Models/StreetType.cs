using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using System.Web.Http;

namespace Citizens.Models
{
    public class StreetType
    {
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; }
        
        //[HttpBindNever]
        //public virtual ICollection<Street> Streets { get; set; }

    }
}