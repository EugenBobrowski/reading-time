(function ($) {
    "use strict";


    var _ = {}, $atfFields, custom_file_frame = {}, $radioImages;


    _.init = function () {
        _.$ = {
            body: $('body')
        };
        _.$.find = _.$.body.find;
        _.$.fields = _.$.body.find('.atf-fields');
        _.search.init();
        _.media.init();
        _.editor.init();
        _.repeater.init();
        _.checklist.init();
    };
    _.checklist = {
        init: function () {
            _.$.checklists = _.$.body.find('.checklist');
            _.$.checklists.sortable({
                items: "li",
                opacity: 0.5,
                cursor: 'move',
                axis: 'y',
                helper: 'clone'
            });
        },

    };
    _.search = {
        init: function () {
            _.$.body.on('focus keyup', '.atf-field-search', _.search.search);
            _.$.body.on('blur', '.atf-field-search', _.search.stop);
            _.$.body.on('click', '.atf-field-search-result-item', _.search.set_value);
            _.$.body.on('click', '.atf-field-search-container .selected', _.search.focus);

        },
        awaiting: false,
        focus: function (e) {
            $(this).parents('.search-box').find('.atf-field-search').trigger('focus');
        },
        search: function (e) {
            var $this = $(this),
                $parent = $this.parents('.search-box'),
                $results = $parent.find('ul');
            $parent.find('.selected').fadeOut();
            $results.addClass('searching');


            clearTimeout(_.search.awaiting);
            _.search.awaiting = setTimeout(function () {
                $.post($this.data('ajax-url'), {
                        action: $this.data('action'),
                        s: $this.val(),
                    },
                    function (response) {
                        $results.removeClass('searching').addClass('results').html(_.search.results_html(response));
                        console.log(response);
                    });
            }, 500);

        },
        results_html: function (r) {
            var str = '';
            $.each(r, function (index, value) {
                str += '<li data-value="' + value.value + '" class="atf-field-search-result-item">' + value.html + '</li>';
            });
            return str;
        },
        set_value: function (e) {
            e.preventDefault();
            var $this = $(this),
                $parent = $this.parents('.search-box');

            $parent.find('.value-field').val($this.data('value'));
            $parent.find('.selected').html($this.html());


            console.log($this.data('value'));
        },
        stop: function (e) {
            var $parent = $(this).parents('.search-box');
            $parent.find('.selected').show();
            $parent.find('.atf-field-search').val('');
            setTimeout(function () {
                $parent.find('ul')
                    .removeClass('searching').removeClass('results');
            }, 200);

        },
    };
    _.media = {
        init: function () {
            _.$.fields.on('click', ".atf-options-upload", _.media.insert_value);

            _.$.fields.on('click', '.atf-options-upload-remove', _.media.remove_value);

            _.$.current_uploader = null;

            $.fn.removeMedia = function () {
                var $mediaContainer = $(this).parent();
                $mediaContainer.find('input').val('');
                $mediaContainer.find('.atf-options-upload').show('slow');
                $mediaContainer.find('.atf-options-upload-screenshot').attr("src", atf_html_helper.url);
                $mediaContainer.find('.atf-options-upload-remove').hide('slow');
            };
        },

        insert_value: function (event) {
            var $this = $(this);
            _.$.current_uploader = $this.parents('.uploader');

            var type = (_.$.current_uploader.hasClass('file')) ? 'file' : 'image';

            event.preventDefault();


            // If the media frame already exists, reopen it.
            if (typeof (custom_file_frame[type]) !== "undefined") {
                // console.log(custom_file_frame);
                custom_file_frame[type].open();
                return;
            }

            // if its not null, its broking custom_file_frame's onselect "activeFileUploadContext"
            custom_file_frame[type] = null;

            // Create the media frame.


            custom_file_frame[type] = wp.media.frames.customHeader = wp.media({
                // Set the title of the modal.
                title: $this.data("choose"),

                // Tell the modal to show only images. Ignore if want ALL
                library: (_.$.current_uploader.hasClass('file')) ? {} : {type: 'image'},
                // Customize the submit button.
                button: {
                    // Set the text of the button.
                    text: $this.data("update")
                }
            });

            custom_file_frame[type].on("select", function () {
                // Grab the selected attachment.
                var attachment = custom_file_frame[type].state().get("selection").first();

                console.log(attachment);

                // Update value of the targetfield input with the attachment url.

                _.$.current_uploader.find('.atf-options-upload-screenshot').attr('src', (attachment.attributes.type == 'image') ? attachment.attributes.url : attachment.attributes.icon);

                if (_.$.current_uploader.hasClass('save-id')) {
                    _.$.current_uploader.find('input').val(attachment.attributes.id).trigger('change');
                } else {
                    _.$.current_uploader.find('input').val(attachment.attributes.url).trigger('change');
                }


                _.$.current_uploader.find('.atf-options-upload').hide();
                _.$.current_uploader.find('.atf-options-upload-screenshot').show();
                _.$.current_uploader.find('.atf-options-upload-remove').show();

                _.$.current_uploader.siblings().find('.insert-attachment-id').each(function () {
                    var $some = $(this);
                    var attr = $some.data('attr');

                    $some.attr(attr, attachment.attributes.id);

                    if (attr.indexOf('data-') === 0) {
                        $some.data(attr.replace('data-', ''), attachment.attributes.id);
                    }

                });

            });

            custom_file_frame[type].open();
        },

        remove_value: function (event) {
            event.preventDefault();
            $(this).parent().removeMedia();
        },

    };
    _.editor = {
        init: function () {
            let __ = _.editor;
            _.$.fields.on('atf.fields.reset_group_item_field', '[data-field-type="editor"]', __.reset_td);
            _.$.body.on('click', '.quicktags-onclick', __.quicktags);
        },
        quicktags: function () {
            var _this = $(this),
                id = _this.attr('id');
            quicktags( { id: id } );
        },
        reset_td: function (e, $td, rowId, oldId) {
            let __ = _.editor;
            __.id_template = $td.data('field-id-template');
            let name_template = $td.data('field-name-template');
            __.find = __.id_template.replace('#', oldId);
            __.replace = __.id_template.replace('#', rowId);

            let $new = $td.clone();

            console.log($new.find('.quicktags-toolbar').html());
            $new.find('.quicktags-toolbar').html('').remove();

            $new.find('.mce-tinymce').remove();
            $new.find('.wp-editor-area').attr('name', name_template.replace('#', rowId));
            console.log($new.html().replace(new RegExp(__.find, 'g'), __.replace));
            $td.html($new.html().replace(new RegExp(__.find, 'g'), __.replace));

            var init, $wrap;


            tinyMCEPreInit.mceInit[__.replace] = tinyMCEPreInit.mceInit[__.find];
            tinyMCEPreInit.mceInit[__.replace].selector = tinyMCEPreInit.mceInit[__.replace].selector.replace(__.find, __.replace);

            tinyMCEPreInit.qtInit[__.replace] = tinyMCEPreInit.qtInit[__.find];
            tinyMCEPreInit.qtInit[__.replace].id = __.replace;

            $wrap = tinymce.$('#wp-' + __.replace + '-wrap');

            if (typeof tinymce !== 'undefined') {

                init = tinyMCEPreInit.mceInit[__.replace];


                if (($wrap.hasClass('tmce-active')) && !init.wp_skip_init) {
                    tinymce.init(init);
                    if (!window.wpActiveEditor) {
                        window.wpActiveEditor = __.replace;
                    }
                }

            }


            if (typeof quicktags !== 'undefined' && $wrap.hasClass('html-active')) {
                $wrap.removeClass('tmce-active').addClass('html-active');
                quicktags(tinyMCEPreInit.qtInit[__.replace]);
                QTags.addButton(tinyMCEPreInit.qtInit[__.replace]);
                if (!window.wpActiveEditor) {
                    window.wpActiveEditor = __.replace;
                }
            }

        },
    };
    _.repeater = {
        init: function () {
            _.$.groups = _.$.fields.find('.atf-options-group');

            _.$.groups.sortable({
                items: ".row",
                handle: '.group-row-id',
                opacity: 0.5,
                cursor: 'move',
                axis: 'y',
                helper: 'clone'
            });

            _.$.groups.find('.row').each(function () {
                $(this).find('input, textarea').first().each(_.repeater.group_title_change);
            });

            $.fn.resetOrder = _.repeater.reset_order;
            $.fn.resetRow = _.repeater.reset_group;

            _.$.fields.on('atf.fields.reset_group_item', _.repeater.reset_group);

            _.$.groups.on('click', '.header', _.repeater.toggle_collapse);
            _.$.groups.on('click', '.btn-control-group.plus', _.repeater.repeat_group);
            _.$.groups.on('click', '.btn-control-group.minus', _.repeater.remove_group);
            _.$.groups.on('change', 'input, textarea', _.repeater.group_title_change);
        },
        toggle_collapse: function (e) {
            e.preventDefault();
            $(this).parents('.row').toggleClass('collapsed');
        },
        repeat_group: function (e) {
            e.preventDefault();
            var $this = $(this);
            var $thisRow = $this.parents('.row').eq(0);

            var $newRow = $thisRow.clone();
            $newRow.hide();
            $newRow.insertAfter($thisRow);
            $newRow.trigger('atf.fields.reset_group_item', [$newRow, $thisRow]);
            $newRow.fadeIn('slow');
            $newRow.resetOrder();
        },
        remove_group: function (e) {
            e.preventDefault();
            var $this = $(this);
            var $thisRow = $this.parents('.row').eq(0);

            var $sibling = $thisRow.siblings('.row');
            if ($sibling.length > 0) {

                $thisRow.fadeOut('slow', function () {
                    $thisRow.remove();
                    $sibling.first().resetOrder();
                });

            } else {
                $thisRow.resetRow();
            }
        },
        reset_group: function (e, $row) {
            var rowId = uniqid();
            let oldId = $row.data('row-id');
            $row.data('row-id', rowId).attr('data-row-id', rowId);
            $row.find('td').each(function () {
                var $td = $(this);

                if ($td.data('field-name-template') !== undefined) {

                    var name = $td.data('field-name-template').replace(new RegExp("#", 'g'), rowId),
                        id = ($td.data('field-id-template') !== undefined) ? $td.data('field-id-template').replace(new RegExp("#", 'g'), rowId) : uniqid();

                    if ($td.data('field-type') === 'addMedia' ||
                        $td.data('field-type') === 'media' ||
                        $td.data('field-type') === 'media_id') {
                        $td.find('.atf-options-upload-screenshot').attr('id', 'screenshot-' + id)
                        $td.removeMedia();
                    } else {
                        $td.trigger('atf.fields.reset_group_item_field', [$td, rowId, oldId]);
                    }
                    // console.log(template);
                    $td.find('.chosen-select').css('display', 'block').next().remove();
                    $td.find('input:not([type="radio"], [type="checkbox"]), select, textarea')
                        .attr('id', id)
                        .attr('name', name)
                        .val('');

                    $td.find('input[type="radio"], input[type="checkbox"]').each(function () {
                        let $checkbox = $(this), val = $checkbox.val(),
                            oldId = $checkbox.attr('id'),
                            newId = id + '__' + val;
                        $checkbox
                            .attr('id', newId)
                            .attr('name', name)
                        $td.find('label[for="' + oldId + '"]')
                            .attr('for', newId);
                    });

                    // $td.append(template);
                    // $td.find('.chosen-select').chosen();
                    name = '';
                }
            });

            $row.find('label').each(function () {
                var $label = $(this);
                if ($label.data('field-id-template') === undefined) return false;

                var id = $label.data('field-id-template').replace(new RegExp("#", 'g'), rowId);

                $label.attr('for', id);

            });

            $row.find('input, textarea').first().each(_.repeater.group_title_change);

        },
        reset_order: function () {
            var i = 1;
            $(this).parent().find('.row').each(function () {
                $(this).find('.group-row-id').text(i);
                i++;
            });
        },
        group_title_change: function (e) {
            var $field = $(this),
                $row = $field.parents('.row'),
                $title = $row.find('.header').find('span'),
                template = $title.data('title-template'),
                field_id = ($field.data('id') === undefined) ? $field.attr('id') : $field.data('id');

            if (template === undefined || template === '') return true;

            $row.find('input, textarea').each(function () {
                var $field = $(this),
                    field_id = ($field.data('id') === undefined) ? $field.attr('id') : $field.data('id');
                template = template.replace(new RegExp("{" + field_id + "}", 'g'), $field.val())
            });

            $title.html(template);

        }
    };

    $(document).ready(function () {

        _.init();
        $atfFields = $('.atf-fields');
        $radioImages = $('.radio-image');

        $atfFields.find('.chosen-select').chosen();

        $('.sections-list ul li a').click(
            function () {
                var $this = $(this);
                $('.sections-body .one-section-body.active').removeClass('active');
                $('.sections-body #' + $this.data('section')).addClass('active');
                $this.parents('.sections-list').find('li .active').removeClass('active');
                $this.addClass('active');
                $('.panel-header h2').html($this.html());
                $('.panel-header .section-description').html($this.data('description'));

                return false;

            }
        );


        $radioImages.find("label").height($(this).parent().height());
        //This script switch visible radio buttons and check hidden input fields

        $radioImages.find("label").click(
            function () {
                $(".radio-image label").removeClass("checked");
                $(this).addClass("checked");
                $(".radio-image label input").prop('checked', false);
                $(".radio-image label input").removeAttr('checked');
                $(this).find("input").attr('checked', "checked");
            }
        );

        $(".color-picker-hex").wpColorPicker();

        if ($('.set_custom_images').length > 0) {
            if (typeof wp !== 'undefined' && wp.media && wp.media.editor) {
                $('.wrap').on('click', '.set_custom_images', function (e) {
                    e.preventDefault();
                    var button = $(this);
                    var id = button.prev();
                    wp.media.editor.send.attachment = function (props, attachment) {
                        id.val(attachment.id);
                    };
                    wp.media.editor.open(button);
                    return false;
                });
            }
        }

        jQuery('.atf-datepicker').datepicker({
            dateFormat: 'dd-mm-yy'
        });

    });

    //googlefonts

    $('.google-webfonts').each(function () {
        var $this = $(this);

        $this.find('.demotext').text($this.find('.demotextinput').val());
    });

    var WebFontConfig = {
        google: {families: ['Roboto:700:latin,greek']}
    };
    (function () {
        var wf = document.createElement('script');
        wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
            '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
        wf.type = 'text/javascript';
        wf.async = 'true';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(wf, s);
    })();

    var uniqid = function (pr, en) {
        var pr = pr || '', en = en || false, result;

        var seed = function (s, w) {
            s = parseInt(s, 10).toString(16);
            return w < s.length ? s.slice(s.length - w) : (w > s.length) ? new Array(1 + (w - s.length)).join('0') + s : s;
        };

        result = pr + seed(parseInt(new Date().getTime() / 1000, 10), 8) + seed(Math.floor(Math.random() * 0x75bcd15) + 1, 5);

        if (en) result += (Math.random() * 10).toFixed(8).toString();

        return result;
    };


}(jQuery));