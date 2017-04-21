/*
 #
 # Copyright (c) 2017 nexB Inc. and others. All rights reserved.
 # http://nexb.com and https://github.com/nexB/aboutcode-manager/
 # The AboutCode Manager software is licensed under the Apache License version 2.0.
 # AboutCode is a trademark of nexB Inc.
 #
 # You may not use this software except in compliance with the License.
 # You may obtain a copy of the License at: http://apache.org/licenses/LICENSE-2.0
 # Unless required by applicable law or agreed to in writing, software distributed
 # under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 # CONDITIONS OF ANY KIND, either express or implied. See the License for the
 # specific language governing permissions and limitations under the License.
 #
 */


const jsdom = require("jsdom");
const window = jsdom.jsdom().defaultView;
const $ = require("jquery")(window);
global.$ = $;

const fs = require("fs");
const chai = require('chai');
const assert = chai.assert;
const chaiSubset = require('chai-subset');
chai.use(chaiSubset);

const AboutCodeDB = require("../assets/js/aboutCodeDB");
const scanCodeJSONResults = JSON.parse(fs.readFileSync(__dirname + "/data/scancode-results.json", "utf8"));

describe("checkAboutCodeDB", function() {

    describe("addRows", function() {
        it("should add rows to database", function () {
            let aboutCodeDB = new AboutCodeDB();

            return aboutCodeDB.db
                .then(() => aboutCodeDB.File.count())
                .then((rowCount) => assert.strictEqual(rowCount, 0))
                .then(() => aboutCodeDB.addRows(scanCodeJSONResults))
                .then(() => aboutCodeDB.File.count())
                .then((rowCount) => assert.strictEqual(rowCount, 2))
                .then(() => aboutCodeDB.License.count())
                .then((licenseCount) => assert.strictEqual(licenseCount,1))
                .then(() => aboutCodeDB.Copyright.count())
                .then((copyrightCount) => assert.strictEqual(copyrightCount, 2))
                .then(() => aboutCodeDB.Package.count())
                .then((packageCount) => assert.strictEqual(packageCount, 1))
                .then(() => aboutCodeDB.Email.count())
                .then((emailCount) => assert.strictEqual(emailCount, 1))
                .then(() => aboutCodeDB.Url.count())
                .then((urlCount) => assert.strictEqual(urlCount, 2))
        });
    });

    describe("findAll", function() {
        it("should return all rows", function() {
            let aboutCodeDB = new AboutCodeDB();

            return aboutCodeDB.db
                .then(() => aboutCodeDB.addRows(scanCodeJSONResults))
                .then(() => aboutCodeDB.findAll({}))
                .then((rows) => {
                    rows = rows.map(row => row.toJSON());
                    assert.containSubset(rows, scanCodeJSONResults.files);
                })
        });
    });

    describe("findOne", function() {
        it("should return one", function() {
            let aboutCodeDB = new AboutCodeDB();

            return aboutCodeDB.db
                .then(() => aboutCodeDB.addRows(scanCodeJSONResults))
                .then(() => aboutCodeDB.findOne({
                    where: { path: "samples/JGroups/src"}
                }))
                .then((row) => {
                    row = row.toJSON();
                    assert.containSubset(row, scanCodeJSONResults.files[1]);
                })
        });
    });

    describe("toJSTreeFormat", function() {
        it("should format ScanCode results to jsTree Format", function() {
            let aboutCodeDB = new AboutCodeDB();
            let expectedJSTreeFormat= [
                {
                    id: 'samples/README',
                    text: 'README',
                    parent: 'samples',
                    type: 'file'
                },
                {
                    id: 'samples/JGroups/src',
                    text: 'src',
                    parent: 'samples/JGroups',
                    type: 'directory'
                }
            ];

            return aboutCodeDB.db
                .then(() => aboutCodeDB.addRows(scanCodeJSONResults))
                .then(() => aboutCodeDB.toJSTreeFormat())
                .then((scanCodeJSONResults) => {
                    assert.deepEqual(expectedJSTreeFormat, scanCodeJSONResults)
                })
        });
    });
});