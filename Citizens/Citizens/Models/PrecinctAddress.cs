using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace Citizens.Models
{
    public enum HouseType { Приватний, Багатоповерхівка };
    public class PrecinctAddress
    {
        [Key]
        [Column(Order = 0)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int CityId { get; set; }

        [Key]
        [Column(Order = 1)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int StreetId { get; set; }

        [Key]
        [Column(Order = 2)]
        [StringLength(10)]
        [Required()]
        public string House { get; set; }

        public HouseType? HouseType { get; set; }

        public int? Apartments { get; set; }

        public int PrecinctId { get; set; }

        public City City { get; set; }

        public Street Street { get; set; }

        public Precinct Precinct { get; set; }

        public ICollection<Person> Persons { get; set; }

        public ICollection<PersonChangeHistory> PersonChangeHistory { get; set; }

    }
}