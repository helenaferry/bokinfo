$(document).ready(function () {

    $("#search_book").on("submit", function (event) {
        event.preventDefault();
        $("#search_results").empty();
        $("#error").hide();
        var search_param = $("#search_param").val(); // TODO Don't search if null
        $("#search_param").val("");

        var url = "http://libris.kb.se/xsearch?query=" + search_param + "&format=json&callback=?";
        var result;
        var buyLink;
        var bookInfo;
        var author;
        var publisher;

        $.getJSON(url, function (json) {
            if (json.xsearch.records == 0) {
                $("#search_results").html("Hittade ingenting.");
                if (isISBN(search_param)) {
                    $("#search_results").append("<br/><br/>Det verkar som att du sökte på ett ISBN-nummer, men inte fick någon träff. Kanske kan du i alla fall ha nytta av autogenererade köplänkar?");
                    bookInfo = createBuyLink(search_param);
                    $("#search_results").append("<div class='panel'><div style='float: right'><textarea><hr/>" + bookInfo + "</textarea></div>" +
	                					          bookInfo +
	                					          "</div>");
                }
                return;
            }
            $.each(json.xsearch.list, function (index) {
                result = json.xsearch.list[index];

                var buyLink = createBuyLink(result.isbn);

                author = formatAuthor(result.creator);
                publisher = formatPublisher(result.publisher);

                bookInfo = "<b>" + ((result.title) ? result.title : "") + "</b>\n" +
	                					      "<br/>Författare: " + author + "\n" +
	                					      "<br/>ISBN: " + ((result.isbn) ? result.isbn : "") + "\n" +
	                					      "<br/>Förlag: " + publisher + " (" + ((result.date) ? result.date : "") + ")\n" +
	                					      "<br/>" + buyLink;

                $("#search_results").append("<div class='panel'><div style='float: right'><textarea><hr/>" + bookInfo + "</textarea></div>" +
	                					      bookInfo +
	                					      "</div>");
            }).fail(function (jqxhr, textStatus, error) {
                $("#error").html("AJDÅ! NÅGOT GICK FEL!");
                $("#error").show();
            })
        });
    });
});

function formatAuthor(authorString) {
    if (!authorString) {
        return "";
    }
    var names = authorString.split(",");
    return names[1] + " " + names[0];
}

function formatPublisher(publisherString) {
    if (!publisherString) {
        return "";
    }
    if (publisherString.indexOf(":") > -1) {
        var parts = publisherString.split(":");
        return parts[1];
    } else {
        return publisherString;
    }
}

function isISBN(string) {
    var cleanup = cleanupISBN(string);
    return /^\d+X?$/.test(cleanup);
}

function cleanupISBN(string) {
    var cleanup = string.replace(/-/g, "");
    cleanup = cleanup.replace(/ /g, "");
    return cleanup;
}

function createBuyLink(isbn) {
    if (!isbn) {
        return "";
    } else {
        return "K&ouml;p: t.ex. hos <a href='http://www.bokus.com/bok/" + isbn + "'>Bokus</a> eller <a href='http://www.adlibris.com/se/product.aspx?isbn=" + isbn + "'>Adlibris</A>";
    }
}