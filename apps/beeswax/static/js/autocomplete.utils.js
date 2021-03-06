// Licensed to Cloudera, Inc. under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  Cloudera, Inc. licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

function hac_jsoncalls(options) {
  if (typeof HIVE_AUTOCOMPLETE_BASE_URL != "undefined") {
    if (options.database == null) {
      $.getJSON(HIVE_AUTOCOMPLETE_BASE_URL, options.onDataReceived);
    }
    if (options.database != null) {
      if (options.table != null) {
        $.getJSON(HIVE_AUTOCOMPLETE_BASE_URL + options.database + "/" + options.table, options.onDataReceived);
      }
      else {
        $.getJSON(HIVE_AUTOCOMPLETE_BASE_URL + options.database + "/", options.onDataReceived);
      }
    }
  }
  else {
    try {
      console.error("You need to specify a HIVE_AUTOCOMPLETE_BASE_URL to use the autocomplete")
    }
    catch (e) {
    }
  }
}

function hac_getTableAliases(textScanned) {
  var _aliases = {};
  var _val = textScanned; //codeMirror.getValue();
  var _from = _val.toUpperCase().indexOf("FROM");
  if (_from > -1) {
    var _match = _val.toUpperCase().substring(_from).match(/ON|WHERE|GROUP|SORT/);
    var _to = _val.length;
    if (_match) {
      _to = _match.index;
    }
    var _found = _val.substr(_from, _to).replace(/(\r\n|\n|\r)/gm, "").replace(/from/gi, "").replace(/join/gi, ",").split(",");
    for (var i = 0; i < _found.length; i++) {
      var _tablealias = $.trim(_found[i]).split(" ");
      if (_tablealias.length > 1) {
        _aliases[_tablealias[1]] = _tablealias[0];
      }
    }
  }
  return _aliases;
}

function hac_getTableColumns(databaseName, tableName, textScanned, callback) {
  if (tableName.indexOf("(") > -1) {
    tableName = tableName.substr(tableName.indexOf("(") + 1);
  }

  var _aliases = hac_getTableAliases(textScanned);
  if (_aliases[tableName]) {
    tableName = _aliases[tableName];
  }

  if ($.totalStorage('columns_' + databaseName + '_' + tableName) != null) {
    callback($.totalStorage('columns_' + databaseName + '_' + tableName));
    hac_jsoncalls({
      database: databaseName,
      table: tableName,
      onDataReceived: function (data) {
        if (data.error) {
          $.jHueNotify.error(data.error);
        }
        else {
          $.totalStorage('columns_' + databaseName + '_' + tableName, (data.columns ? data.columns.join(" ") : ""));
        }
      }
    });
  }
  else {
    hac_jsoncalls({
      database: databaseName,
      table: tableName,
      onDataReceived: function (data) {
        if (data.error) {
          $.jHueNotify.error(data.error);
        }
        else {
          $.totalStorage('columns_' + databaseName + '_' + tableName, (data.columns ? data.columns.join(" ") : ""));
          callback($.totalStorage('columns_' + databaseName + '_' + tableName));
        }
      }
    });
  }
}

function hac_tableHasAlias(tableName, textScanned) {
  var _aliases = hac_getTableAliases(textScanned);
  for (var alias in _aliases) {
    if (_aliases[alias] == tableName) {
      return true;
    }
  }
  return false;
}

function hac_getTables(databaseName, callback) {
  if ($.totalStorage('tables_' + databaseName) != null) {
    callback($.totalStorage('tables_' + databaseName));
    hac_jsoncalls({
      database: databaseName,
      onDataReceived: function (data) {
        if (data.error) {
          $.jHueNotify.error(data.error);
        }
        else {
          $.totalStorage('tables_' + databaseName, data.tables.join(" "));
        }
      }
    });
  }
  else {
    hac_jsoncalls({
      database: databaseName,
      onDataReceived: function (data) {
        if (data.error) {
          $.jHueNotify.error(data.error);
        }
        else {
          $.totalStorage('tables_' + databaseName, data.tables.join(" "));
          callback($.totalStorage('tables_' + databaseName));
        }
      }
    });
  }
}