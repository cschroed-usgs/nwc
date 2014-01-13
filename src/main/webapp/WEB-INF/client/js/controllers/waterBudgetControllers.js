/*global angular,NWC,OpenLayers,$,CONFIG*/
(function(){
    var waterBudgetControllers = angular.module('nwc.controllers.waterBudget', []);
    
    
    waterBudgetControllers.controller('WaterBudget', ['$scope',
        function ($scope) {
            $scope.name = "Water Budget";
            $scope.description = "Retrieve water data comprising all components of a water budget.";
        }
    ]);
waterBudgetControllers.controller('PlotData', ['$scope', 'StoredState', 'CommonState', 'WaterBudgetPlot',
    NWC.ControllerHelpers.StepController(
        {
            name: 'Plot Water Budget Data',
            description: 'Visualize the data for your HUC of interest.'
        },
        function ($scope, StoredState, CommonState, WaterBudgetPlot) {
            var plotDivSelector = '#waterBudgetPlot';
            var legendDivSelector = '#waterBudgetLegend';
            StoredState.plotTimeDensity  = StoredState.plotTimeDensity || 'daily';
            $scope.$watch('StoredState.plotTimeDensity', function(newValue, oldValue){
                if(newValue !== oldValue){
                    plotData(newValue);
                }
            });
            /**
             * {String} category the category of data to plot (daily or monthly)
             */
            var plotData = function(category){
                var values = CommonState.DataSeriesStore[category].data;
                var labels = CommonState.DataSeriesStore[category].metadata.seriesLabels;
                WaterBudgetPlot.setPlot(plotDivSelector, legendDivSelector, values, labels);
            };
            //boolean property is cheaper to watch than deep object comparison
            $scope.$watch('CommonState.newDataSeriesStore', function(newValue, oldValue){
                if(newValue){
                    CommonState.newDataSeriesStore = false;
                    plotData(StoredState.plotTimeDensity);
                }
            });
            
            $scope.CommonState = CommonState;
            $scope.StoredState = StoredState;
        })
]);

waterBudgetControllers.controller('SelectHuc', ['$scope', 'StoredState', 'CommonState', 'WaterBudgetMap', '$log',
    NWC.ControllerHelpers.StepController(
        {
            name: 'HUC Selection',
            description: 'Find your Hydrologic Unit of interest.'
        },
        function ($scope, StoredState, CommonState, WaterBudgetMap, $log) {
            $scope.StoredState = StoredState;
            $scope.CommonState = CommonState;
            
            var map = WaterBudgetMap.getMap();
            
            
                map.render('hucSelectMap');
                map.zoomToExtent(map.restrictedExtent, true);
        
            
            
            $log.info(CommonState);
        }
    )
]);

waterBudgetControllers.controller('SelectCounty', ['$scope', 'StoredState', 'CommonState', 'WaterBudgetMap', 'SosSources', '$http',
    NWC.ControllerHelpers.StepController(
            {
                name: 'County Selection',
                description: 'Select water use data for a county that intersects with your HUC'
            },
    function ($scope, StoredState, CommonState, WaterBudgetMap) {
        var map = WaterBudgetMap.getMap();
        map.render('hucSelectMap');
        var setCounty = function(countyFeature){
            StoredState.county = countyFeature;
        };
        map.getCountyThatIntersectsWithHucFeature(StoredState.huc, setCounty);
    })
]);

waterBudgetControllers.controller('DisambiguateClick', ['$scope', 'StoredState', 'CommonState', '$log',
    NWC.ControllerHelpers.StepController(
        {
            name: 'HUC Disambiguation',
            description: 'Your click fell near multiple HUCs. Select one from the list to continue.'
        },
        function ($scope, StoredState, CommonState, $log) {             
            $scope.hucs = CommonState.ambiguousHucs;
            
			$scope.setHuck = function(huc) {
                                StoredState.huc = huc;
				StoredState.hucId = huc.attributes.HUC_12;
			};
			
            $log.info(StoredState);
        }
    )
]);

waterBudgetControllers.controller('FinalStep', ['$scope', 'StoredState', '$state', 'CommonState', '$log',
    NWC.ControllerHelpers.StepController(
        {
            name: 'Final Step',
            description: "You're all done!"
        },
        function ($scope, StoredState, $state, CommonState, $log) {
            StoredState._clientState.name = $state.current.name;
            StoredState._clientState.params = $state.params;
            
            
            $log.info(CommonState);
        }
    )
]);

waterBudgetControllers.controller('Restore', [
            '$scope',  'StoredState',  '$state',   '$timeout', '$http',    '$modal',
    function($scope,    StoredState,    $state,     $timeout,   $http,      $modal){
        $scope.stateId = $state.params.stateId;
        var retrieveState = function(){
            $http.get('../../misc/' + $scope.stateId + '.json')
                    .success(function(data){
                        Object.merge(StoredState, data);
                        $state.go(StoredState._clientState.name, StoredState._clientState.params);
                    })
                    .error(function(){
                        $modal.open({
                            template: 'Error Retrieving State'
                        });
                    });
        };
        $timeout(retrieveState, 3000);
        
    }
]);
}());