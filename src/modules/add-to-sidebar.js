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
    return contentContainer;
}

function createHeading(headingText) {
    var el = document.createElement("div");
    el.classList.add("discussion-sidebar-heading");
    el.classList.add("text-bold");
    el.innerHTML = headingText;
    return el;
}

var
    stylesId = "hubberdashery-sidebar-item-styles",
    sidebarClass = "hubberdashery-sidebar-item";

function addSidebarContainerStylesIfRequired() {
    if (document.getElementById(stylesId)) {
        return;
    }
    var el = document.createElement("style");
    el.type = "text/css";
    el.id = stylesId;
    el.innerHTML =
    `
    .${sidebarClass} {
        border-width: 1px 0 0 0;
        border-style: solid;
        border-color: #e6ebf1;
        margin-top: 15px;
    }
    `;
    document.body.appendChild(el);
}

function createContainerInDiscussionSidebar() {
    addSidebarContainerStylesIfRequired();
    var parent = document.querySelector(".discussion-sidebar");
    if (!parent) {
        console.error("Can't find [.discussion-sidebar]");
        return;
    }

    var container = document.createElement("div");
    container.classList.add("discussion-sidebar-item");
    container.classList.add("sidebar-trello-items");
    container.classList.add(sidebarClass);
    parent.appendChild(container)
    return container;
}

module.exports = addItemsToSidebar;