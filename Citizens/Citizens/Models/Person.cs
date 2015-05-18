using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Citizens.Models
{
    public enum Gender { ж, ч };
    public class Person
    {
        public int Id { get; set; }

        [StringLength(20)]
        public string FirstName { get; set; }

        [StringLength(20)]
        public string MidleName { get; set; }

        [StringLength(20)]
        public string LastName { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public Gender? Gender { get; set; }

        [ForeignKey("PrecinctAddress")]
        [Column(Order = 1)]
        [Required]
        public int CityId { get; set; }

        [ForeignKey("PrecinctAddress")]
        [Column(Order = 2)]
        public int? StreetId { get; set; }

        [ForeignKey("PrecinctAddress")]
        [Column(Order = 3)]
        [StringLength(10)]
        public string House { get; set; }

        public int? Apartment { get; set; }

        public City City { get; set; }

        public Street Street { get; set; }

        [NotMapped]
        public int PrecinctId { get; set; }

        public PrecinctAddress PrecinctAddress { get; set; }
    }
}