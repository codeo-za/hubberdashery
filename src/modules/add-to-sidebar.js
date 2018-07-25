function addItemsToSidebar(headingText, contentArray) {
    if(!Array.isArray(contentArray)) {
        contentArray = [contentArray];
    }

	// Create the heading
	var trelloSidebarHeading = document.createElement("div");
	trelloSidebarHeading.classList.add("discussion-sidebar-heading");
	trelloSidebarHeading.classList.add("text-bold");
    trelloSidebarHeading.innerHTML = headingText;
	trelloSidebarItem.appendChild(trelloSidebarHeading);
    
    contentArray.forEach(element => {
        // Create the content
        var trelloSidebarContent = document.createElement("div");
        trelloSidebarContent.innerHTML = content;

        // Create the sidebar item
        var trelloSidebarItem = document.createElement("div");
        trelloSidebarItem.classList.add("discussion-sidebar-item");
        trelloSidebarItem.classList.add("sidebar-trello");

        // Append the side bar item heading and content.
        trelloSidebarItem.appendChild(element);
    });
    
	// Append the sidebar item to the side panel
	var discussionSidebar = document.getElementById('partial-discussion-sidebar');
	discussionSidebar.appendChild(trelloSidebarItem);
}

module.exports = addItemsToSidebar;