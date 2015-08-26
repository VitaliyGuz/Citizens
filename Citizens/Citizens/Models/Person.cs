using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Citizens.Models
{

    public enum Gender { ж, ч };
    public class PersonBase
    {
        [Key]
        [Column(Order = 0)]
        public virtual int Id { get; set; }

        [StringLength(20)]
        public string FirstName { get; set; }

        [StringLength(20)]
        public string MidleName { get; set; }

        [StringLength(25)]
        public string LastName { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public Gender? Gender { get; set; }

        [ForeignKey("PrecinctAddress")]
        [Column(Order = 3)]
        [Required]
        public int CityId { get; set; }

        [ForeignKey("PrecinctAddress")]
        [Column(Order = 4)]
        public int StreetId { get; set; }

        [ForeignKey("PrecinctAddress")]
        [Column(Order = 5)]
        [StringLength(10)]
        [Index]
        [Required()]
        public string House { get; set; }

        public int? Apartment { get; set; }

        [StringLength(20)]
        public string ApartmentStr { get; set; }

        public City City { get; set; }

        public Street Street { get; set; }

        [NotMapped]
        public int PrecinctId { get; set; }

        public PrecinctAddress PrecinctAddress { get; set; }

        public ICollection<PersonAdditionalProperty> PersonAdditionalProperties { get; set; }
    }

    public class Person : PersonBase
    {
        [Key]
        [Column(Order = 0)]
        public override int Id { get; set; }
    }

    [Table("PersonChangeHistory")]
    public class PersonChangeHistory : PersonBase
    {
        [Key]
        [Column(Order = 0)]
        public override int Id { get; set; }

        [Key]
        [Column(Order = 1)]
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public DateTime ChangeTime { get; set; }

        [Key]
        [Column(Order = 2)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public string UserId { get; set; }

        public ApplicationUser User { get; set; }

    }
}