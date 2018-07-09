function PullRequestPagerHack() {
    this.init();
};

PullRequestPagerHack.prototype = {
    init : function(){
        var files = document.getElementsByClassName('file');
        var pageSize = 10;
        var pageCount = files.length / pageSize;
        var selectedPageIndex = 0;
        var pageContainer = null;
        var expectedFileCount = parseInt(document.getElementById('files_tab_counter').innerText);
        var timerHandle = null;
    
        console.info(`expanding ${expectedFileCount} files`);
    
        var width = function(){
           return window.innerWidth 
               || document.documentElement.clientWidth 
               || document.body.clientWidth 
               || 0;
        };
    
        var height = function(){
               return window.innerHeight 
               || document.documentElement.clientHeight 
               || document.body.clientHeight 
               || 0;
        }
    
        var isFileContentExpanded = function(file){
            return file.className.match(/\sopen\s/g) == null;
        };
    
        var toggleFileContents = function(file){
            var expanderButton = file.getElementsByClassName('js-details-target')[0];
            window.setTimeout(expanderButton.click.bind(expanderButton),0);
        };
    
        var collapseFileContent = function(file){
            if (!isFileContentExpanded(file)){
                return;
            }
            toggleFileContents(file);
        };
    
        var attachFileInfoExpandCollapseEvent = function(file){
            if (file._hasAttachedExpandCollapseEvent){
                return;
            }
    
            var header = file.getElementsByClassName('file-info')[0];
            header.addEventListener('click', (e) => toggleFileContents(file, e));
            header.style.cursor = 'pointer';
            file._hasAttachedExpandCollapseEvent = true;
        };
    
        var areAllFilesLoaded = function(files){
            var allLoaded = files.length == expectedFileCount;
            if (allLoaded){
                return true;
            }

            // if not matching, then we have to investigate a bit deeper
            if (files.length > 0){
                var lastFile = files[files.length - 1];
                return lastFile.nextElementSibling == null;
            }

            return false;
        };
    
        var showPage = function(pageIndex){
            selectedPageIndex = pageIndex;
    
            var startFileIndex = pageIndex * pageSize;
            var endFileIndex = startFileIndex + pageSize;
            for(var fileIndex = 0; fileIndex < files.length; fileIndex++){
                var show = fileIndex >= startFileIndex && fileIndex < endFileIndex;
                var file = files[fileIndex];
                file.style.display = show ? 'block' : 'none';
    
                if (show){
                    if (!file._hasContentLoaded){
                        // check if the contents need to be expanded
                        file._hasContentLoaded = true;
                        var includeFragments = Array.from(file.getElementsByTagName('INCLUDE-FRAGMENT'));
                        if (includeFragments.length > 0){
                            includeFragments.forEach(x => {
                                var buttons = x.getElementsByTagName('BUTTON');
                                var loadMoreBtn = buttons.length > 0 ? buttons[0] : null;
                                if (loadMoreBtn){
                                    window.setTimeout(loadMoreBtn.click.bind(loadMoreBtn), 0);
                                }
                            });
                        }
                    }

                    //collapseFileContent(file);
                    //attachFileInfoExpandCollapseEvent(file);
                }
            }
        };
    
        var lastFileCount = 0;
    
        var updatePageOptions = function(){
            files = document.getElementsByClassName('file');
            var fileCount = files.length;
    
            if (lastFileCount === fileCount){
                // no need to update
                return; 
            }
    
            pageCount = Math.ceil(fileCount / pageSize);
    
            // add options
            var optionsHtml = [];
            var pageStart = 0;
            for(var i = 0; i < pageCount; i++){
                var pageEnd = pageStart + pageSize;
                if (pageEnd > fileCount){
                    pageEnd = fileCount;
                }
    
                optionsHtml.push(`<option data-page='${i}' value='${i}' style='padding:8px; border: 1px solid #d9d9d9; cursor: pointer;'>Files: ${pageStart + 1} - ${pageEnd}</option>`);
                pageStart += pageSize;
            }
    
            var selectList = document.getElementById('hb-pager-select');
            selectList.innerHTML = optionsHtml.join('\r\n');
            lastFileCount = fileCount;
    
            if (areAllFilesLoaded(files)){
                if (timerHandle){
                    clearInterval(timerHandle);
                }
    
                // enable controls
                var ids = ['hb-pager-prev', 'hb-pager-select', 'hb-pager-next'];
                ids.forEach(x => document.getElementById(x).disabled = false);
                showPage(0);
            }
        };
    
        var centerContainerOnScreen = function(container){
            container.style.left = (width()/2 - (container.offsetWidth/2)) + "px";
            container.style.top = (height() - container.offsetHeight - 20) + "px";
        };
    
        var createSelectPager = function(){
            // create the static container
            pageContainer = document.createElement('div')
            pageContainer.id = 'hb-pager';
            pageContainer.style.position = "fixed";
            pageContainer.style.top = "0px";
            pageContainer.style.left = "-1000px";
            pageContainer.style.margin = '0px';
            pageContainer.style.zIndex = '99999';
            pageContainer.style.backgroundColor = 'transparent';
            document.getElementsByTagName('body')[0].appendChild(pageContainer);
    
            console.info('building up hubber dashery pager links');
            var pagerHtml = [];
            pagerHtml.push(`<button id='hb-pager-prev' disabled='disabled' class="btn btn-sm btn-outline">&#8592;</button>`);
            pagerHtml.push('&nbsp;');
            pagerHtml.push(`<select id='hb-pager-select' disabled='disabled' class='btn-outline' style='border:2px solid grey; width:150px; height:30px; padding:8px; border: 1px solid #d9d9d9; cursor: pointer; text-align-last:center'>`);
            pagerHtml.push('</select>');
            pagerHtml.push('&nbsp;');
            pagerHtml.push(`<button id='hb-pager-next' disabled='disabled' class="btn btn-sm btn-outline">&#8594;</button>`);
            
            pageContainer.innerHTML = pagerHtml.join('');
            document.getElementById('hb-pager-select').addEventListener('change', onPageChangeHandler);
    
            var changeSelectedPage = (delta) =>{
                var newPage = selectedPageIndex + delta;
                if (newPage < 0 || newPage >= pageCount){
                    return;
                }
                document.getElementById("hb-pager-select").selectedIndex = newPage;
                showAndScrollToPage(newPage);
            }
            document.getElementById('hb-pager-prev').addEventListener('click', () => changeSelectedPage(-1));
            document.getElementById('hb-pager-next').addEventListener('click', () => changeSelectedPage(1));
            updatePageOptions();	
            centerContainerOnScreen(pageContainer);
        };
    
        var showAndScrollToPage = function(page){
            if (page < 0 || page >= pageCount){
                return;
            }
            showPage(parseInt(page));
            window.scrollTo(0, 0);
        }
    
        var onPageChangeHandler = function(e){
            var page = e.target.value;
            showAndScrollToPage(page);
        };
    
        window.addEventListener("resize", function(event) {
            centerContainerOnScreen(pageContainer);
        });
    
        var hiddenFragments = document.getElementsByTagName('INCLUDE-FRAGMENT');
        hiddenFragments[hiddenFragments.length - 1].scrollIntoView();
        window.scrollTo(0,0);
    
        createSelectPager();
        timerHandle = window.setInterval(updatePageOptions, 3000);
    }
};

PullRequestPagerHack.urlMatch = /.*\/pull\/.*\/files.*/;
module.exports = PullRequestPagerHack;