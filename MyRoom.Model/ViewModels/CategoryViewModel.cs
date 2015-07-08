using System;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Web;

namespace MyRoom.Model.ViewModels
{
    public class CategoryViewModel  : BaseViewModel
    {
        public int CategoryId { get; set; }

        public int ModuleId { get; set; }

        public string Name { get; set; }

        public string Image { get; set; }

        [DefaultValue(0)]
        public int IdParentCategory { get; set; }

        public int? CategoryItem { get; set; }

        public bool IsFirst { get; set; }

        public bool IsFinal { get; set; }

        public bool CategoryActive { get; set; }

        public string Comment { get; set; }

        public int? Orden { get; set; }

        public bool? Pending { get; set; }

        public string Prefix { get; set; }

        public string ModuleName { get; set; }

        public int CatalogId { get; set; }

        public string SpanishDesc { get; set; }

        public string EnglishDesc { get; set; }

        public string FrenchDesc { get; set; }

        public string GermanDesc { get; set; }

        public bool TranslationActiveDesc { get; set; }

        public string LanguageDesc5 { get; set; }

        public string LanguageDesc6 { get; set; }

        public string LanguageDesc7 { get; set; }

        public string LanguageDesc8 { get; set; }
    }
}