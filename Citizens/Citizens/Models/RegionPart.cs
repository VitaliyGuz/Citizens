using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

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

        public ICollection<CityRegionPart> CityRegionParts { get; set; }

        public ICollection<Precinct> Precincts { get; set; }

        public ICollection<UserRegionPart> UserRegionParts { get; set; }
    }

    public class RegionPartComputed
    {
        public int Id { get; set; }

        public int CountMajors { get; set; }

        public int CountElectors { get; set; }

        public int CountHouseholds { get; set; }
    }
}