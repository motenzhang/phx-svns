<%@ Page Language="C#" AutoEventWireup="true" %>
<%@ Import Namespace="System.IO" %>

<script runat="server">
    const string UploadBasePath = "uploadfiles/images/";

    protected void Page_Load(object sender, EventArgs e)
    {
        //System.Threading.Thread.Sleep(2000);
        if (Request.HttpMethod != "POST")
        {
            return;
        }

        StringBuilder sb = new StringBuilder();
        sb.Append("[");

        string uploadPath = Path.Combine(UploadBasePath, Request.QueryString["subfolder"] ?? "");        
        Random rnd = new Random();
        for (int i = 0; i < Request.Files.Count; i++)
        {
            HttpPostedFile file = Request.Files[i];

            bool Success = false;
            string errReason = "";
            string fileName = "";

            if (file.ContentLength == 0)
            {
                errReason = "文件大小为 0 字节。";
            }
            else if (!".jpg.jpeg.gif.png.bmp.zip.rar.txt.pdf.doc.docx.xls.xlsx.ppt.pptx.flv.swf".Contains(Path.GetExtension(file.FileName).ToLower()))
            {
                errReason = "不允许上传该类型的文件。";
            }
            else
            {

                fileName = Path.Combine(uploadPath, string.Format("{0:yyyy-MM-dd_HH-mm-ss-ffff}_{1:D4}_{2}", DateTime.Now, rnd.Next(10000), /*GetChineseSpell*/(Path.GetFileName(file.FileName.Replace(";", "")))));

                //string thumbFileName, type;
                //int width, height, thumbWidth, thumbHeight;
                //this.SaveThumbImage(file, fileName, 140, out thumbFileName, out width, out height, out thumbWidth, out thumbHeight, out type);

                try
                {
                    string mapFileName = Server.MapPath(Path.Combine("../../../../", fileName));
                    string path = Path.GetDirectoryName(mapFileName);
                    if (!Directory.Exists(path))
                        Directory.CreateDirectory(path);
                    file.SaveAs(mapFileName);
                    Success = true;
                }
                catch (UnauthorizedAccessException ex)
                {
                    errReason = string.Format("{0} ASP.NET运行账户:{1}。", ex.Message, System.Environment.UserName);
                }
                catch (Exception ex)
                {
                    errReason = string.Format("{0} Type:{1}", ex.Message, ex.GetType());
                }
            }
            if (i > 0)
            {
                sb.Append(", ");
            }
            sb.Append("{");
            sb.AppendFormat("\"Success\":{0}", Success ? "true" : "false");
            sb.AppendFormat(", \"ErrReason\":\"{0}\"", FixedJsStr(errReason));
            sb.AppendFormat(", \"NewFileName\":\"{0}\"", FixedJsStr(fileName.Replace('\\', '/')));
            sb.AppendFormat(", \"OriFileName\":\"{0}\"", FixedJsStr(file.FileName));
            sb.Append("}");
        }

        sb.Append("]");

        Response.Clear();
        Response.Write(sb);
        
        if (!IsPostBack)
        {
            // 如果由其他程序（页面） 提交的请求， 则不显示下面的表单了
            Response.End();
        }
    }

    public static string FixedJsStr(string jsStr)
    {
        if (jsStr == null)
            return null;
        string ret = jsStr.Replace(@"\", @"\\");
        //ret = ret.Replace("'", @"\'");
        ret = ret.Replace(@"\""", @"\""");
        ret = ret.Replace("\r", "");
        ret = ret.Replace("\n", @"\");
        return ret;
    }

    public static string GetChineseSpell(string strText)
    {
        StringBuilder sb = new StringBuilder();
        for (int i = 0, j = strText.Length; i < j; i++)
        {
            sb.Append(getSpell(strText[i].ToString()));
        }
        return sb.ToString();
    }

    static string getSpell(string cnChar)
    {
        byte[] arrCN = System.Text.Encoding.Default.GetBytes(cnChar);
        if (arrCN.Length > 1)
        {
            int area = (short)arrCN[0];
            int pos = (short)arrCN[1];
            int code = (area << 8) + pos;
            int[] areacode = { 45217, 45253, 45761, 46318, 46826, 47010, 47297, 47614, 48119, 48119, 49062, 49324, 49896, 50371, 50614, 50622, 50906, 51387, 51446, 52218, 52698, 52698, 52698, 52980, 53689, 54481 };
            for (int i = 0; i < 26; i++)
            {
                int max = 55290;
                if (i != 25) max = areacode[i + 1];
                if (areacode[i] <= code && code < max)
                {
                    return System.Text.Encoding.Default.GetString(new byte[] { (byte)(97 + i) });
                }
            }
            return "";
        }
        else return cnChar;
    }

</script>


<form runat="server">
    <asp:FileUpload runat="server" />
    <asp:FileUpload runat="server" />
    <asp:Button runat="server" Text="上传" />
</form>
