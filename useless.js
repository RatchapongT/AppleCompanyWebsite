
               for(var i = 0; i < searchCustomer.bank.length; i++) { %>
                <strong>Bank <%= i %></strong>

                <input type="hidden" value="<%= searchCustomer.id %>" name="id"/>
                <div class="form-group">
                    Bank Number<input type="text" class="form-control login-field"
                                  placeholder="Bank Number" name="bankNumber"
                                  value="<%= searchCustomer.bank[i].bankNumber %>"/>
                </div>
                <div class="form-group">
                    Bank Name<input type="text" class="form-control login-field"
                                  placeholder="Bank Name" name="bankName"
                                  value="<%= searchCustomer.bank[i].bankName %>"/>
                </div>
                <div class="form-group">
                    Bank Type<input type="text" class="form-control login-field"
                                  placeholder="Bank Type" name="bankType"
                                  value="<%= searchCustomer.bank[i].bankType %>"/>
                </div>
                <% } %>



                <% for(var i = 0; i < dataRelationship.length; i++) { %>
                        <tr>
                            <td align="center"><%= dataRelationship[i].username %></td>
                            <td align="center"><%= dataRelationship[i].customerID %></td>
                            <% date = new Date(dataRelationship[i].created) %>
                            <td align="center"><%= date.getDate() %>/<%= date.getMonth() %>
                                /<%= date.getFullYear() %></td>
                            </td>
                            <td align="center"><a
                                        href="/users/delete_relationship/<%= dataRelationship[i].id %>/<%= dataRelationship[i].customerID %>/<%= dataRelationship[i].username %>"
                                        class="button"><span class="fui-cross"
                                                             style="color:#f93c3c"></span></a>
                            </td>
                        </tr>
                        <% } %>


               var userSchema = new Schema({
                   username: String,
                   password: String,
                   created: {type: Date, default: Date.now}
               });

               var userDetailSchema = new Schema({
                   accountType: String,
                   nickname: String,
                   phone: String,
                   lineID: String,
                   _userDetail: {type: Schema.Types.ObjectId, ref: 'User'},
                   created: {type: Date, default: Date.now}
               });

               var workerSchema = new Schema({
                   _profileDetail: {type: Schema.Types.ObjectId, ref: 'UserDetail'},
                   created: {type: Date, default: Date.now}
               });