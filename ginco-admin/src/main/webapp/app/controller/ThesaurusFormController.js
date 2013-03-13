Ext.define('GincoApp.controller.ThesaurusFormController', {
	extend : 'Ext.app.Controller',

	models : [ 'ThesaurusModel' ],
	stores : [ 'MainTreeStore' ],

    localized : true,

    xDeleteMsgLabel : 'Are you sure to delete this thesaurus?',
    xDeleteMsgTitle : 'Delete this thesaurus?',
    xSucessLabel : 'Success!',
    xSucessSavedMsg : 'Thesaurus saved successfully',
    xSucessRemovedMsg : 'Thesaurus removed successfully',
    xProblemLabel : 'Error !',
    xProblemSaveMsg : 'Unable to save this thesaurus!',
    xProblemDeleteMsg : 'Unable to delete this thesaurus!',

	loadPanel : function(theForm) {
		var me = this;
		var model = this.getThesaurusModelModel();
		var thesaurusData = theForm.up('thesaurusPanel').thesaurusData;
		if (thesaurusData != null) {
			theForm.getEl().mask("Chargement");
			model.load(thesaurusData.id, {
				success : function(model) {
					me.loadData(theForm, model);
					theForm.getEl().unmask();
				}
			});
		} else {
			model = Ext.create('GincoApp.model.ThesaurusModel');
			model.id = -1;
			theForm.loadRecord(model);
		}
	},
	loadData : function(aForm, aModel) {
		var thesaurusPanel = aForm.up('thesaurusPanel');
		thesaurusPanel.setTitle(aModel.data.title);
		thesaurusPanel.thesaurusData = aModel.data;
		aForm.setTitle(aModel.data.title);
		aForm.loadRecord(aModel);
		thesaurusPanel.down('button[cls=newBtnMenu]').setDisabled(false);
        thesaurusPanel.down('button[cls=delete]').setDisabled(false);
        thesaurusPanel.down('button[cls=exportsBtnMenu]').setDisabled(false);
	},
	onNewTermBtnClick : function(theButton, e, options) {
		var thePanel = theButton.up('thesaurusPanel');
		this.createPanel('GincoApp.view.TermPanel',thePanel.thesaurusData );
	},
	
	onNewConceptBtnClick : function(theButton, e, options) {
		var thePanel = theButton.up('thesaurusPanel');
		this.createPanel('GincoApp.view.ConceptPanel',thePanel.thesaurusData );
	},
	
	onNewConceptArrayBtnClick : function(theButton) {
		var thePanel = theButton.up('thesaurusPanel');
		this.createPanel('GincoApp.view.ConceptArrayPanel',thePanel.thesaurusData);
	},
	
	onNewConceptGroupBtnClick : function(theButton) {
		var thePanel = theButton.up('thesaurusPanel');
		this.createPanel('GincoApp.view.ConceptGroupPanel',thePanel.thesaurusData);
	},
	
	createPanel : function(aType, thesaurusData)
	{
		var aNewPanel = Ext.create(aType);
		aNewPanel.thesaurusData = thesaurusData;
		var topTabs = Ext.ComponentQuery.query('topTabs')[0];
		var tab = topTabs.add(aNewPanel);
		topTabs.setActiveTab(tab);
		tab.show();
		return aNewPanel;
	},

    getActivePanel : function() {
        var topTabs = Ext.ComponentQuery.query('topTabs')[0];
        return topTabs.getActiveTab();
    },

    deleteThesaurus : function(theButton){
        var me = this;
        var theForm = theButton.up('form');
        var globalTabs = theForm.up('topTabs');
        var thePanel = me.getActivePanel();

        var updatedModel = theForm.getForm().getRecord();
            Ext.MessageBox.show({
                title : me.xDeleteMsgTitle,
                msg : me.xDeleteMsgLabel,
                buttons : Ext.MessageBox.YESNOCANCEL,
                fn : function(buttonId) {
                    switch (buttonId) {
                        case 'no':
                            break;
                        case 'yes':
                            updatedModel.destroy({
                                success : function(record, operation) {
                                    Thesaurus.ext.utils.msg(me.xSucessLabel,
                                        me.xSucessRemovedMsg);
                                    me.application.fireEvent('thesaurusdeleted',thePanel.thesaurusData);
                                    globalTabs.items.each(function(item){
                                        if(item.thesaurusData.id == record.data.id) {
                                            item.close();
                                        }
                                    });
                                    globalTabs.remove(thePanel);
                                },
                                failure : function(record, operation) {
                                    Thesaurus.ext.utils.msg(me.xProblemLabel,
                                        operation.error);
                                }
                            });
                            break;
                    }
                },
                scope : this
            });

    },

    exportHierarchical : function(theButton) {
        var me = this;
        var theForm = theButton.up('form');
        var url = "services/ui/exportservice/getHierarchical?thesaurusId="
            + encodeURIComponent(theForm.up('thesaurusPanel').thesaurusData.id);
        window.open(url);
    },

	saveForm : function(theButton, theCallback) {
		var me = this;
		var theForm = theButton.up('form');
		if (theForm.getForm().isValid()) {
			theForm.getEl().mask("Chargement");
			theForm.getForm().updateRecord();
			var updatedModel = theForm.getForm().getRecord();
			updatedModel.save({
				success : function(record, operation) {
					me.loadData(theForm, record);
					theForm.getEl().unmask();
					Thesaurus.ext.utils.msg('Succès',
							'Le thesaurus a été enregistré!');
					me.application.fireEvent('thesaurusupdated');
					if (theCallback && typeof theCallback == "function") {
						theCallback();
					}
				},
				failure : function() {
					theForm.getEl().unmask();
					Thesaurus.ext.utils.msg('Problème',
							"Impossible d'enregistrer le thesaurus!");
				}
			});
		}
	},
	init : function(application) {
		this.control({
			'thesaurusPanel form' : {
				afterrender : this.loadPanel
			},
			'thesaurusPanel button[cls=save]' : {
				click : this.saveForm
			},
            'thesaurusPanel button[cls=delete]' : {
                click : this.deleteThesaurus
            },
			"thesaurusPanel #newTermBtn" : {
				click : this.onNewTermBtnClick
			},
            "thesaurusPanel #exportHierarchical" : {
                click : this.exportHierarchical
            },
			"thesaurusPanel #newConceptBtn" : {
				click : this.onNewConceptBtnClick
			},
			"thesaurusPanel #newConceptArrayBtn" : {
				click : this.onNewConceptArrayBtnClick
			},
			"thesaurusPanel #newConceptGroupBtn" : {
				click : this.onNewConceptGroupBtnClick
			}
		});
	}
});
