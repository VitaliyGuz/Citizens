using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace Citizens.Models
{
    public class PersonAdditionalProperty
    {
        [Key]
        [Column(Order = 0)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int PersonId { get; set; }

        public Person Person { get; set; }

        [Key]
        [Column(Order = 1)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int PropertyKeyId { get; set; }

        public PropertyKey PropertyKey { get; set; }

        public int? IntValue { get; set; }

        public string StringValue { get; set; }

        public DateTime? DateTimeValue { get; set; }

        public int? PropertyValueId { get; set; }

        public PropertyValue PropertyValue { get; set; }
    }
}