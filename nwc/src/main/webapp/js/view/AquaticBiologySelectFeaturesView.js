var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.AquaticBiologySelectFeaturesView = NWC.view.BaseView.extend({
	templateName : 'aquaticBiologySelectFeatures',  
        context : {
        },
        
        events: {
            'change input[type=checkbox]': ('checkboxChanged','biodataFormEnable'),
            'click #selected-sites-button' : 'showSites',
            'click #allSelected' : 'selectAll',
            'click #biodata-form-button' : 'sitesDoc'
        },

        initialize : function() {
            this.context.biodataSites = this.model.get('sites');
            this.context.gages = this.model.get('gages');
            this.context.hucs = this.model.get('hucs');
            $('#sites-table-div').html({biodataSites : this.model.get('sites')});
            $('#gages-table-div').html({gages : this.model.get('gages')});
            $('#hucs-table-div').html({hucs : this.model.get('hucs')});
            NWC.view.BaseView.prototype.initialize.apply(this, arguments);
        },
       
        checkboxChanged: function (evt) {
            
            $cb      = $(evt.target),
            name     = $cb.attr('name');
            if (name !== 'allSelected') {
                if ($cb.is(':checked')) {
                    this.model.set({ 
                    'selected' : this.model.get('selected').concat(name)
                    });
                } else {
                    var selected = this.model.get('selected');
                    var index = selected.indexOf(name);
                        if (index > -1) {
                            selected.splice(index, 1);
                            this.model.set({ 'selected' : selected});        
                        }
                    }
            }
        },
        
        biodataFormEnable : function() {
		var disable = !($('#sites-table-div input').is(':checked'));
		$('#biodata-form-button').prop('disabled', disable);
	},

        selectAll : function(evt){
            $cb      = $(evt.target);
            var checkAll = ($cb.prop('checked'));
            $('.sites-table td input[type="checkbox"]').each(function() {
                $(this).prop('checked', checkAll).change();
            });
        },
        
        sitesDoc : function () {
                var bioDataSiteSelectionDoc;
                var preselectBioDataSites = function (siteIds) {
                    var doc = bioDataSiteSelectionDoc;
                    var siteNumbersElt = $(doc).find('siteNumbers').empty()[0];
                    siteIds.each(function (siteId) {
                        var child = doc.createElement('siteNumber');
                        child.textContent = siteId;
                        siteNumbersElt.appendChild(child);
                    });

                    //serialize xml document
                    var xmlString = "";
                    
                    try {
                    	xmlString = (new XMLSerializer()).serializeToString(doc);
                    } catch(e) {}

                    //Give IE a shot
                    if (xmlString.length <= 0 && window.ActiveXObject) {
                        xmlString = doc.xml;
                    }
                    $("[name='currentQuery']").val(xmlString);
                    $('#bioData_form').submit();
                };
                var siteIds = this.model.get('selected');

                if (bioDataSiteSelectionDoc) {
                    preselectBioDataSites(siteIds);
                } else {
                    //retrieve document from server
                    $.ajax({
                        url: 'templates/xml/BioDataSiteSelection.xml',
                        success : function (response, status, jqXHR) {
                            bioDataSiteSelectionDoc = response;
                            preselectBioDataSites(siteIds);
                        },
                        error : function (response, status, jqXHR) {
                            alert("Error Retrieving BioData query skeleton");
                        },
                        context : this
                    });
                }
            }
        
});