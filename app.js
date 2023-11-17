//Angular code for list
const app = angular
  .module('countriesApp', ['dsServices', 'rndServices', 'keyProvider'])
  .constant('_', window._);

app.controller(
  'countryMapController',
  function ($scope, $http, dsServices, rndServices, keyProvider, $interval, _) {
    let dSelected;
    let chart;
    let index = 0;

    $scope.selectedTimeline = 'Ds';
    $scope.hideCitiesFlag = false;
    $scope.hideCitiesTitle = 'Hide';
    $scope.groupedCitiesCopy = [];
    $scope.speedOption = 'slow';
    $scope.disableButton = false;

    const addLines = (dataSelected) => {
      // Remove existing lines
      if (chart.dataProvider.lines) {
        chart.dataProvider.lines = [];
      }

      // Remove existing labels
      if (chart.dataProvider.images) {
        chart.dataProvider.images = [];
      }

      // Add lines based on the latitude and longitude of each city
      for (let i = 1; i < dataSelected.length; i++) {
        const fromCity = dataSelected[i - 1];
        const toCity = dataSelected[i];

        // Check if latitude and longitude values are valid
        if (
          !isNaN(fromCity.latitude) &&
          !isNaN(fromCity.longitude) &&
          !isNaN(toCity.latitude) &&
          !isNaN(toCity.longitude)
        ) {
          chart.dataProvider.lines.push({
            latitudes: [fromCity.latitude, toCity.latitude],
            longitudes: [fromCity.longitude, toCity.longitude],
            color: '#FF0000', // Line color
            alpha: 0.6, // Line transparency
            thickness: 2 // Line thickness
          });

          // Add label for the city
          chart.dataProvider.images.push({
            type: 'circle',
            width: 7,
            height: 7,
            color: '#FF0000', // Label color
            longitude: toCity.longitude,
            latitude: toCity.latitude,
            title: toCity.city + ', ' + toCity.country,
            value: toCity.city + ', ' + toCity.country
          });
        }
      }

      chart.validateData();
    };

    const createMap = (dataSelected) => {
      const targetSVG =
        'M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z';

      //Map code
      if (!chart) {
        chart = AmCharts.makeChart('mapdiv', {
          type: 'map',
          theme: 'dark',

          imagesSettings: {
            rollOverColor: '#089282',
            rollOverScale: 3,
            selectedScale: 3,
            selectedColor: '#089282',
            color: '#13564e',
            labelPosition: 'bottom', // Set label position
            labelText: '[[title]]' // Display the title (city, country) as the label text
          },
          projection: 'mercator',
          panEventsEnabled: true,
          backgroundColor: '#e1e1e1',
          backgroundAlpha: 1,
          zoomControl: {
            zoomControlEnabled: true
          },
          dataProvider: {
            map: 'worldHigh',
            getAreasFromMap: true,
            areas: dataSelected
          },
          areasSettings: {
            autoZoom: true,
            selectedColor: '#9BABB2', //Countries visited
            outlineColor: '#000000', //Countries outlines
            color: '#cccccc', //Countries NOT Visited
            rollOverColor: '#F2EEE3', //Hover over countries NOT visited
            rollOverOutlineColor: '#000000' //Hover over countries outline NOT visited
          }
        });

        // Add lines after the chart is created
        addLines(dataSelected);
      } else {
        // If the chart already exists, just update the data
        chart.dataProvider.areas = dataSelected;
        chart.validateData();

        // Add lines after updating the data
        addLines(dataSelected);
      }
    };

    //For Countries Table
    createMap([]);

    const defineIntervalTime = () => {
      return $scope.speedOption === 'slow' ? 1400 : $scope.speedOption === 'medium' ? 1000 : 200;
    };

    const groupCitiesByMonthWithTimer = (countriesData) => {
      $scope.disableButton = true;

      const sortedCities = countriesData.timeline.sort((a, b) => {
        const dateA = new Date(a.dateVisited).getTime();
        const dateB = new Date(b.dateVisited).getTime();
        return dateA - dateB;
      });

      const intervalId = $interval(() => {
        if (index < sortedCities.length) {
          const city = sortedCities[index];
          $scope.groupedCitiesCopy.push(city);
          createMap($scope.groupedCitiesCopy);
          index++;
        } else {
          $interval.cancel(intervalId);
          $scope.disableButton = false;
        }
      }, defineIntervalTime());

      $scope.$on('$destroy', () => {
        $interval.cancel(intervalId);
      });

      // Function to stop the interval and enable buttons
      $scope.stopGroupCitiesByMonthWithTimer = () => {
        $interval.cancel(intervalId);
        $scope.disableButton = false;
      };
    };

    $scope.switchTimelines = () => {
      if ($scope.selectedTimeline === 'Ds') {
        $scope.selectedTimeline = 'RnDs';
      } else {
        $scope.selectedTimeline = 'Ds';
      }
    };

    $scope.HandleGroupCitiesByMonthWithTimer = () => {
      if ($scope.selectedTimeline === 'Ds') {
        groupCitiesByMonthWithTimer(dsServices);
      } else {
        groupCitiesByMonthWithTimer(rndServices);
      }
    };

    $scope.switchSpeedOption = function () {
      switch ($scope.speedOption) {
        case 'slow':
          $scope.speedOption = 'medium';
          break;
        case 'medium':
          $scope.speedOption = 'fast';
          break;
        case 'fast':
          $scope.speedOption = 'slow';
          break;
        default:
          break;
      }
    };
  }
);
