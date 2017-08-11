
/**
 * Created by liwei on 2017/8/2.
 */
;(function () {
  'use strict';

  var $form_add_task = $('.add-task'),
      new_task = {},
      task_list = {},
      $delete_task,
      $detail_mask = $('.task-detail-mask'),
      $detail = $('.task-detail'),
      $detail_task,
      current_index,
      $update_form,
      $update_form_content,
      $checkbox
      ;


  /**
  * 初始化数据
  * */
  init();


/**
* 监听添加新的task submit事件
* */
  $form_add_task.on('submit',on_add_task_form_submit);

  function on_add_task_form_submit(e) {
    //var  new_task = {};
    /*禁用默认行为*/
    e.preventDefault();
    /*获取新task的值*/
    var $input = $(this).find('input[name=content]');
    new_task.content = $input.val();
    if(!new_task.content) return;
    /*存入新的task*/
    if (add_task(new_task)){
      // render_task_list();
      $input.val('');
    }
  }

  /**
  * 监听删除按钮的点击事件
  * */
  function listen_delete_task() {
    $delete_task.on('click',function () {
      /*找到删除元素所在的index*/
      var index = $(this).parents('.task-item').data('index');
      var _tmp = confirm('确认删除？');
      _tmp ? delete_task(index) : null;
    });
  }

  function listen_detail() {
    $detail_task.on('click',function () {
      var index = $(this).parents('.task-item').data('index');
      show_detail(index);
    });

    $('.task-item').on('dblclick',function () {
      var index = $(this).data('index');
      show_detail(index);
    })
  }

  /**
   * 监听完成task事件
   * */
  function listen_checkbox() {
    $checkbox.on('change',function () {
      var index = $(this).parents('.task-item').data('index');
      var flag = $(this).prop('checked');
      console.log(flag);
      update_task(index, {flag: flag});
    })
  }

  /*查看task详情*/
  function show_detail(index) {
    current_index = index;
    $detail_mask.show();
    $detail.show();
    render_task_detail(index);
  }

  function update_task(index,data) {
    if(index == undefined || !task_list[index]) return;
    task_list[index] = $.extend({},task_list[index],data);
    // task_list[index] = data;
    refresh_task_list();
  }
  
  function init() {
    task_list = store.get('task_list') || [];
    if(task_list.length){
      render_task_list();
    }
  }

  /**
   * 添加task
   * */
  function add_task(new_task) {
    /*将新的task推入task_list*/
    task_list.push(new_task);
    /*更新localStorage的值*/
    refresh_task_list();
    return true;
  }

  /**
   * 删除一条task
   * */
  function delete_task(index){
    /*如果没有index，或index不存在就直接返回*/
    if(index == undefined || !task_list[index]) return;

    delete task_list[index];
    /*更新localStorage的值*/
    refresh_task_list();


  }
  /**
   * 刷新localStorage的数据并渲染模板
   * */
  function refresh_task_list() {
    store.set('task_list',task_list);
    render_task_list();
  }

  /**
   * 渲染全部task模板
   * */
/*  function render_task_list() {
    var $task_list = $('.task-list');
    $task_list.html('');
    var flag_item = [];
    for (var i = 0; i <task_list.length; i++) {
      var item = task_list[i];
      console.log('item',item)
      // if(item && item.flag) {
      //   flag_item.push(item);
      // } else {
      //   console.log('item',item)
      //   var $task = render_task_item(item,i);
      //
      //   $task_list.prepend($task);
      // }
      var $task = render_task_item(item,i);

      $task_list.prepend($task);
    }

    // console.log('flag_item',flag_item);
    // for (var j = 0; j < flag_item.length; j++) {
    //   var $task = render_task_item(flag_item[j],j);
    //   $task.addClass('completed');
    //   $task_list.append($task);
    // }

    $delete_task = $('.delete');
    $detail_task = $('.detail');
    $checkbox = $('.task-list .complete');
    listen_delete_task();
    listen_detail();
    listen_checkbox();

  }*/
  function render_task_list() {
    var $task_list = $('.task-list');
    $task_list.html('');

    for (var i = 0; i <task_list.length; i++) {
      var $task = render_task_item(task_list[i],i);
      $task_list.prepend($task);
    }

    $delete_task = $('.delete');
    $detail_task = $('.detail');
    $checkbox = $('.task-list .complete');
    listen_delete_task();
    listen_detail();
    listen_checkbox();

  }

  /**
   * 渲染单挑task模板
   * */
  function render_task_item(data,index) {
    if(!data || index == undefined) return;
    var list_item_tpl = '<div class="task-item" data-index="'+index+'">\
                          <span><input class="complete" type="checkbox" '+(data.flag ? "checked" : "" ) + '></span>\
                          <span class="task-content">'+data.content+'</span>\
                          <span class="fr">\
                            <span class="action delete"> 删除</span>\
                            <span class="action detail">详细</span>\
                          </span>\
                        </div>';
    return $(list_item_tpl);
  }

  /**
   * 渲染指定task的详细信息
   * */
  function render_task_detail(index){
    if(index == undefined || !task_list[index]) return;
    var item = task_list[index];
    var tpl = '<form class="detail_wrapper"> \
                <div class="title">'+item.content+'</div>\
                <div style="display: none"><input type="text" name="title" value="'+item.content+'"></div>\
                <div class="desc">\
                  <textarea name="desc" value="">'+(item.desc || "" )+'</textarea>\
                </div>\
                <div class="remind">\
                  <input type="date" name="date" value="'+(item.date || "" )+'">\
                </div>\
                <div><button type="submit">更新</button></div>\
              </form>';
    $('.task-detail').html(tpl);
    $update_form = $('.task-detail').find('form');
    $update_form_content = $update_form.find('.title');

    /**
    * 更新详细
    * */
    $update_form.on('submit',function (e) {
      e.preventDefault();
      var data = {};
      data.content = $(this).find('[name=title]').val();
      data.desc = $(this).find('[name=desc]').val();
      data.date = $(this).find('[name=date]').val();
      update_task(index,data);
      $detail_mask.hide();
      $detail.hide();
    });

    $update_form_content.on('dblclick',function () {
      $(this).hide().next().show();
    })
  }

  $('.task-detail-mask').on('click',function () {
    $(this).hide();
    $detail.hide();
  });





})();