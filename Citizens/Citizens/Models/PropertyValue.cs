using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Citizens.Models
{
    public class PropertyValue
    {
        public int Id { get; set; }

        public int PropertyKeyId { get; set; }

        public PropertyKey PropertyKey { get; set; }

        public string Value { get; set; }

        public ICollection<PersonAdditionalProperty> PersonAdditionalProperties { get; set; }

    }
}