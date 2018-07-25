"use strict";

function addItemsToSidebar(headingText, contentArray) {
    if (!Array.isArray(contentArray)) {
        contentArray = [contentArray];
    }

    var container = createContainerInDiscussionSidebar();
    if (!container) {
        return;
    }

    console.debug("have side-bar container: ", container);

    container.appendChild(createHeading(headingText));

    contentArray.forEach(content => {
        var element = createItemElementFor(content);
        console.debug("have content element: ", element);
        container.appendChild(element);
    });
}

function createItemElementFor(htmlContent) {
    // Create the content
    var contentContainer = document.createElement("div");
    contentContainer.innerHTML = htmlContent;

    // Create the sidebar item
    var sidebarItem = document.createElement("div");
    sidebarItem.classList.add("discussion-sidebar-item");
    sidebarItem.classList.add("sidebar-trello");

    // Append the side bar item heading and content.
    sidebarItem.appendChild(contentContainer);
}

function createHeading(headingText) {
    var el = document.createElement("div");
    el.classList.add("discussion-sidebar-heading");
    el.classList.add("text-bold");
    el.innerHTML = headingText;
    return el;
}

function createContainerInDiscussionSidebar() {
    var parent = document.querySelector(".discussion-sidebar");
    if (!parent) {
        console.error("Can't find [.discussion-sidebar]");
        return;
    }

    var container = document.createElement("div");
    parent.appendChild(container)
    return container;
}

module.exports = addItemsToSidebar;