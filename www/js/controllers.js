angular.module('starter.controllers', [])

//演示一个时间拾取器定制案例
.controller('DashCtrl', function($scope,$ionicModal,$morphPacker) {


    function toHH(time){
        var t = '';
        if(time<10){
            t = '0' + time;
        }else{
            t = time;
        }
        return String(t);
    }
    //克隆
    function clone(obj){
        var result={};
        for(key in obj){
            result[key]=obj[key];
        }
        return result;
    };  

    //选择数据模型
    $scope.data = {
        selectedItemHH: {value: toHH(new Date().getHours())},
        selectedItemMM: {value: toHH(new Date().getMinutes())}
    };

	//初始化数据模型
	$scope.dateItemsHH = [{ value: '00'}];
    $scope.dateItemsMM = [{ value: '00' }];

    //遍历数据模型
    for (var i = 23; i>0; i--) {
        var hh = {};
        if(i<10){
          hh ={'value':'0' + String(i)};
        }else{
          hh = {'value':String(i)};
        }
        $scope.dateItemsHH.push(hh);
    }
    for (var i = 59; i>0; i--) {
        var mm ={};
        if(i<10){
            mm ={'value':'0' + String(i)};
        }else{
            mm = {value:String(i)};
        }
        $scope.dateItemsMM.push(mm);
    }

    //建立一个模态框
    ///////////////////////////////////////////////////////////////////////
    //时间选择器
    $ionicModal.fromTemplateUrl('templates/modal/date-list-modal.html', {
            scope: $scope,
            animation: 'slide-in-up',
            backdropClickToClose: false
        }).then(function(modal) {
            $scope.datePackerModal = modal;
    });
    var tempPrevData = {};    
    //打开时间拾取器    
    $scope.openDatePackerModal = function() {

        $scope.datePackerModal.show();
        $morphPacker.update('modal-carouselHH');
        $morphPacker.update('modal-carouselMM');

        tempPrevData = clone($scope.data); 
    };
    
    //关闭时间拾取器  
    $scope.closeDatePackerModal = function(isRest) {
        $scope.datePackerModal.hide();
        if(isRest){
            $scope.data = tempPrevData; 
        }
    };




})

//帮助
.controller('HelpCtrl', function($scope) {
  
})
//关于我们
.controller('AboutCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
