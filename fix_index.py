path = r"c:\Users\Owen\OneDrive\Desktop\TCB-prototype\main\index.html"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()
broken = """                      <a href="javascript:void(0)" onclick="initiateDirectRegistration('patent-form', 'upload')"><i class="fa-solid fa-file-arrow-up"></i> Upload Completed Form</a>
                    <div class="sub-sub-dropdown-content">
                      <a href="javascript:void(0)" onclick="initiateDirectRegistration('copyright-form', 'upload')"><i class="fa-solid fa-file-arrow-up"></i> Upload Completed Form</a>
                      <a href="javascript:void(0)" onclick="initiateDirectRegistration('copyright-form', 'online')"><i class="fa-solid fa-pen-to-square"></i> Fill Out Online Form</a>
                    </div>
                  </div>
                  <a href="javascript:void(0)" onclick="navigateTo('guidelines', false, { serviceId: 'copyright' })"><i class="fa-solid fa-book-open"></i> Guidelines</a>
                </div>
              </div>"""
fixed = """                      <a href="javascript:void(0)" onclick="initiateDirectRegistration('patent-form', 'upload')"><i class="fa-solid fa-file-arrow-up"></i> Upload Completed Form</a>
                      <a href="javascript:void(0)" onclick="initiateDirectRegistration('patent-form', 'online')"><i class="fa-solid fa-pen-to-square"></i> Fill Out Online Form</a>
                    </div>
                  </div>
                  <a href="javascript:void(0)" onclick="navigateTo('guidelines', false, { serviceId: 'patent' })"><i class="fa-solid fa-book-open"></i> Guidelines</a>
                </div>
              </div>
              <div class="nav-item-sub-dropdown">
                <a href="javascript:void(0)" class="dropdown-item sub-trigger"><i class="fa-solid fa-copyright"></i> Copyright <i class="fa-solid fa-chevron-right" style="font-size: 0.6rem; margin-left: auto; opacity: 0.5;"></i></a>
                <div class="sub-dropdown-content">
                  <div class="nav-item-sub-sub-dropdown">
                    <a href="javascript:void(0)" class="dropdown-item sub-trigger-sub"><i class="fa-solid fa-file-circle-plus"></i> Register Copyright <i class="fa-solid fa-chevron-right" style="font-size: 0.6rem; margin-left: auto; opacity: 0.5;"></i></a>
                    <div class="sub-sub-dropdown-content">
                      <a href="javascript:void(0)" onclick="initiateDirectRegistration('copyright-form', 'upload')"><i class="fa-solid fa-file-arrow-up"></i> Upload Completed Form</a>
                      <a href="javascript:void(0)" onclick="initiateDirectRegistration('copyright-form', 'online')"><i class="fa-solid fa-pen-to-square"></i> Fill Out Online Form</a>
                    </div>
                  </div>
                  <a href="javascript:void(0)" onclick="navigateTo('guidelines', false, { serviceId: 'copyright' })"><i class="fa-solid fa-book-open"></i> Guidelines</a>
                </div>
              </div>"""
new_content = content.replace(broken, fixed)
if new_content == content:
    # Try with different line endings
    new_content = content.replace(broken.replace("\n", "\r\n"), fixed.replace("\n", "\r\n"))
with open(path, "w", encoding="utf-8") as f:
    f.write(new_content)
