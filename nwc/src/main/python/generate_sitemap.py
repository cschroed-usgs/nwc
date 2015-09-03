import sys
import datetime
import generation_commons as gc
from jinja2 import Template
from jinja2 import FileSystemLoader
from jinja2.environment import Environment
import math
import os

'''
Creates the sitemaps for the ids using template and base_file_name
Return the list of sitemap files created
    attributes - list of dictionaries that contain the data
    template_file_name - String template file name
    dest_dir - String destination dir
    base_file_name - String base file name to write the sitemap out 
        to within the dir defined by the 'dest_dir' parameter. 
        Will be suffixed by a number. Sitemaps must be paged like 
        this since sitemaps have a maximum number of links per file.
    base_context - dictionary of information to provide to templates  
    env - jinja2.environment
'''
def create_sitemaps(attributes, template_file_name, dest_dir, base_file_name, base_context, env):
    SITEMAP_URL_LIMIT = 50000

    template = env.get_template(template_file_name)
    
    file_count = math.ceil(len(attributes) / float(SITEMAP_URL_LIMIT))
    index = 1
    file_names = []
    while index <= file_count:
        sitemap_filename = '%s%d.xml' % (base_file_name, index)
        this_file_name = os.path.join(dest_dir, sitemap_filename)
        file_names.append(sitemap_filename)
        
        file = open(this_file_name, 'w')
        context = base_context.copy()
        if index == file_count:
            last_index = len(attributes) - 1
        else:
            last_index = index * SITEMAP_URL_LIMIT - 1
        context['attributes'] = attributes[(index - 1) * SITEMAP_URL_LIMIT:last_index]
        file.write(template.render(context))
        file.close()
        
        index = index + 1
    return file_names

'''
generate sitemap.xml and children
  data - a dictionary describing geoserver features and sciencebase items 
  destination_dir - a dir to put the sitemap files into
  rootContext - a dictionary to provide context for the templates
'''
def generate_sitemap(data, destination_dir, context):        
    TEMPLATE_BASE_DIR = os.path.join('templates', 'sitemap')
    WB_HUC_TEMPLATE = 'waterbudget_huc.xml'
    SF_HUC_TEMPLATE = 'streamflow_huc.xml'
    SF_GAGE_TEMPLATE = 'streamflow_gage.xml'
    PROJECT_TEMPLATE = 'project.xml'
    DATA_TEMPLATE = 'data.xml'
    INDEX_TEMPLATE = 'index.xml'
    HOME_TEMPLATE = 'home.xml'
    SITEMAP_DIR = 'sitemap'
    sitemap_destination_dir = os.path.join(destination_dir, SITEMAP_DIR)
    gc.make_sure_path_exists(sitemap_destination_dir)
    env = Environment(autoescape=True)
    env.loader = FileSystemLoader(TEMPLATE_BASE_DIR)
    
    print 'Creating sitemap files in %s'  % sitemap_destination_dir
    sitemap_files = []
    sitemap_files.extend(create_sitemaps([{}], HOME_TEMPLATE, sitemap_destination_dir, 'sitemap_home', context, env))
    sitemap_files.extend(create_sitemaps(data['waterbudget_hucs'], WB_HUC_TEMPLATE, sitemap_destination_dir, 'sitemap_wb_huc', context, env))
    sitemap_files.extend(create_sitemaps(data['streamflow_gages'], SF_GAGE_TEMPLATE, sitemap_destination_dir, 'sitemap_sf_gage', context, env))
    sitemap_files.extend(create_sitemaps(data['streamflow_hucs'], SF_HUC_TEMPLATE, sitemap_destination_dir, 'sitemap_sf_huc', context, env))
    sitemap_files.extend(create_sitemaps(data['projects'], PROJECT_TEMPLATE, sitemap_destination_dir, 'sitemap_project', context, env))
    sitemap_files.extend(create_sitemaps(data['datasets'], DATA_TEMPLATE, sitemap_destination_dir, 'sitemap_data', context, env))

    template = env.get_template(INDEX_TEMPLATE)
        
    index_context = context.copy()
    index_context['sitemap_files'] = sitemap_files
    sitemap_file = open(os.path.join(sitemap_destination_dir, 'sitemap.xml'), 'w')    
    sitemap_file.write(template.render(index_context))
    sitemap_file.close()


def main(argv):

    args = gc.parse_args(sys.argv)
    geoserver = args.geoserver
    sciencebase = args.sciencebase_url
    
    
    context = {
               'root_url' : args.root_url,
               'last_modified' : datetime.datetime.now().strftime('%Y-%m-%d')
               }
    data = gc.get_nwc_data(geoserver, sciencebase)

    generate_sitemap(data, args.destination_dir, context)

if __name__=="__main__":
    main(sys.argv)
    print 'Done'
