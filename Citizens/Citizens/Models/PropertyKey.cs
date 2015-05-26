using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Citizens.Models
{
    public enum PropertyType { Число, Рядок, Дата, Довідник, Місто, Вулиця };
    public class PropertyKey
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public PropertyType PropertyType { get; set; }

        public ICollection<PropertyValue> PropertyValues { get; set; }

        public ICollection<PersonAdditionalProperty> PersonAdditionalProperties { get; set; }
    }
}